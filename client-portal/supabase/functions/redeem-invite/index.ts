// Supabase Edge Function: redeem-invite
//
// Turns a NoirFlow invite code ("pass key") into a real email + password
// account. This is the ONE portal operation that needs Supabase's admin
// powers (creating a user), so it lives here — inside Supabase, where the
// service-role key is provided automatically — instead of in the web app.
// The portal itself never holds a key that bypasses Row Level Security.
//
// Called server-to-server by client-portal/app/auth/actions.js. Public by
// design (anyone signing up is anonymous), so every check happens here:
// the code must exist, be unused, unexpired, match the email lock, and be
// claimed atomically before an account is created.
//
// Deploy: supabase functions deploy redeem-invite --no-verify-jwt

import { createClient } from 'npm:@supabase/supabase-js@2';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_GROUPS = 3;
const CODE_GROUP_LENGTH = 4;

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function reply(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function fail(error: string) {
  return reply({ ok: false, error });
}

// Must match normalizeInviteCode() in client-portal/lib/invite.js exactly,
// or valid codes would hash differently and be rejected.
function normalizeInviteCode(raw: unknown): string | null {
  const cleaned = String(raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = cleaned.startsWith('NF') ? cleaned.slice(2) : cleaned;
  if (body.length !== CODE_GROUPS * CODE_GROUP_LENGTH) return null;
  const groups = [];
  for (let i = 0; i < CODE_GROUPS; i++) {
    groups.push(body.slice(i * CODE_GROUP_LENGTH, (i + 1) * CODE_GROUP_LENGTH));
  }
  return `NF-${groups.join('-')}`;
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Creates the login. If the email already has an account that has NEVER been
// signed into and isn't linked to any client or admin (e.g. left over from
// testing), that dormant account is taken over instead — it holds no data and
// no access, so nothing is lost and the invite still decides what it can see.
async function createOrReuseAccount(email: string, password: string) {
  const { data: created, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (!error && created.user) return { userId: created.user.id };

  const alreadyExists = /already|registered|exists/i.test(error?.message || '');
  if (!alreadyExists) {
    console.error('[redeem-invite] createUser failed:', error);
    return { error: 'Could not create your account. Please try again.' };
  }

  const { data: dormantId, error: lookupError } = await supabase.rpc('portal_dormant_user_id', { p_email: email });
  if (lookupError) console.error('[redeem-invite] dormant lookup failed:', lookupError);
  if (!dormantId) return { error: 'An account with this email already exists. Sign in instead.' };

  const { error: updateError } = await supabase.auth.admin.updateUserById(dormantId, { password, email_confirm: true });
  if (updateError) {
    console.error('[redeem-invite] dormant account update failed:', updateError);
    return { error: 'Could not create your account. Please try again.' };
  }
  return { userId: dormantId as string };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply({ ok: false, error: 'Method not allowed' }, 405);

  let input: Record<string, unknown>;
  try {
    input = await req.json();
  } catch {
    return reply({ ok: false, error: 'Invalid request' }, 400);
  }

  const code = normalizeInviteCode(input.code);
  const email = String(input.email ?? '').trim().toLowerCase();
  const password = String(input.password ?? '');

  if (!code) return fail('That invite code doesn’t look right. It should look like NF-XXXX-XXXX-XXXX.');
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return fail('Enter a valid email address.');
  if (password.length < MIN_PASSWORD_LENGTH) return fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

  const nowIso = new Date().toISOString();
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('id, role, client_id, email')
    .eq('code_hash', await sha256Hex(code))
    .is('used_at', null)
    .gt('expires_at', nowIso)
    .maybeSingle();

  if (inviteError) {
    console.error('[redeem-invite] invite lookup failed:', inviteError);
    return fail('We couldn’t check your code right now. Please try again in a minute.');
  }
  if (!invite) return fail('This invite code is invalid, expired, or already used. Ask NoirFlow for a new one.');
  if (invite.email && invite.email.toLowerCase() !== email) {
    return fail('This invite code was issued for a different email address.');
  }

  if (invite.role === 'client') {
    const { data: client } = await supabase.from('clients').select('auth_user_id').eq('id', invite.client_id).maybeSingle();
    if (!client || client.auth_user_id) {
      return fail('This business already has an account. Sign in instead, or ask NoirFlow for help.');
    }
  }

  // Claim before creating the account. The `used_at is null` filter makes
  // this compare-and-set: two people racing the same code can't both win.
  const { data: claimed } = await supabase
    .from('invites')
    .update({ used_at: nowIso })
    .eq('id', invite.id)
    .is('used_at', null)
    .select('id')
    .maybeSingle();
  if (!claimed) return fail('This invite code was just used. Ask NoirFlow for a new one.');

  const account = await createOrReuseAccount(email, password);
  if (!account.userId) {
    await supabase.from('invites').update({ used_at: null }).eq('id', invite.id);
    return fail(account.error!);
  }

  await supabase.from('invites').update({ used_by: account.userId }).eq('id', invite.id);

  const link =
    invite.role === 'admin'
      ? await supabase.from('admins').insert({ user_id: account.userId })
      : await supabase
          .from('clients')
          .update({ auth_user_id: account.userId, contact_email: email, updated_at: nowIso })
          .eq('id', invite.client_id)
          .is('auth_user_id', null);

  if (link.error) {
    console.error('[redeem-invite] linking account failed:', link.error);
    return fail('Your account was created but couldn’t be linked. Contact NoirFlow and we’ll fix it right away.');
  }

  console.log(`[redeem-invite] ${invite.role} account ready for ${email}`);
  return reply({ ok: true, role: invite.role });
});
