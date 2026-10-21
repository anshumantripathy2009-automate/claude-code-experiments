'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '../../lib/supabase/server';
import { hashInviteCode, normalizeInviteCode } from '../../lib/invite';
import { isRateLimited } from '../../lib/rateLimit';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCredentials(formData) {
  return {
    email: String(formData.get('email') || '').trim().toLowerCase(),
    password: String(formData.get('password') || ''),
  };
}

async function homeFor(userId) {
  const service = createServiceClient();
  const { data } = await service.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
  return data ? '/admin' : '/dashboard';
}

export async function signIn(formData) {
  if (await isRateLimited('sign-in', 10)) {
    return { ok: false, error: 'Too many attempts. Wait 15 minutes and try again.' };
  }

  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    return { ok: false, error: 'Enter your email and password.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  // Same message for "no such account" and "wrong password", so the login
  // form can't be used to find out which emails have accounts.
  if (error || !data.user) {
    return { ok: false, error: 'Email or password is incorrect.' };
  }

  redirect(await homeFor(data.user.id));
}

// Redeems an invite code ("pass key") and creates the account. There is no
// other way to get an account — public Supabase signups should be disabled
// (see README "Required Supabase settings").
export async function redeemInvite(formData) {
  if (await isRateLimited('redeem-invite', 10)) {
    return { ok: false, error: 'Too many attempts. Wait 15 minutes and try again.' };
  }

  const code = normalizeInviteCode(formData.get('code'));
  const { email, password } = readCredentials(formData);
  const confirmPassword = String(formData.get('confirm_password') || '');

  if (!code) return { ok: false, error: 'That invite code doesn’t look right. It should look like NF-XXXX-XXXX-XXXX.' };
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return { ok: false, error: 'Enter a valid email address.' };
  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (password !== confirmPassword) return { ok: false, error: 'The two passwords don’t match.' };

  const service = createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: invite, error: lookupError } = await service
    .from('invites')
    .select('*')
    .eq('code_hash', hashInviteCode(code))
    .is('used_at', null)
    .gt('expires_at', nowIso)
    .maybeSingle();

  // A lookup *error* (bad service key, database down) is not the client's
  // fault — don't tell them their code is wrong when it may be fine.
  if (lookupError) {
    console.error('[auth] invite lookup failed:', lookupError);
    return { ok: false, error: 'We couldn’t check your code right now. Please try again in a minute.' };
  }
  if (!invite) {
    return { ok: false, error: 'This invite code is invalid, expired, or already used. Ask NoirFlow for a new one.' };
  }
  if (invite.email && invite.email.toLowerCase() !== email) {
    return { ok: false, error: 'This invite code was issued for a different email address.' };
  }

  if (invite.role === 'client') {
    const { data: client } = await service.from('clients').select('id, auth_user_id').eq('id', invite.client_id).maybeSingle();
    if (!client || client.auth_user_id) {
      return { ok: false, error: 'This business already has an account. Sign in instead, or ask NoirFlow for help.' };
    }
  }

  // Claim the invite before creating the user. The `used_at is null` filter
  // makes this a compare-and-set: if two people submit the same code at the
  // same moment, only one update matches a row.
  const { data: claimed } = await service
    .from('invites')
    .update({ used_at: nowIso })
    .eq('id', invite.id)
    .is('used_at', null)
    .select('id')
    .maybeSingle();

  if (!claimed) {
    return { ok: false, error: 'This invite code was just used. Ask NoirFlow for a new one.' };
  }

  // email_confirm: true — the invite code is the proof that this person was
  // approved, so there's no second "confirm your email" step to get lost in.
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    await service.from('invites').update({ used_at: null }).eq('id', invite.id);
    const alreadyExists = createError && /already|registered|exists/i.test(createError.message || '');
    console.error('[auth] createUser failed:', createError);
    return {
      ok: false,
      error: alreadyExists
        ? 'An account with this email already exists. Sign in instead.'
        : 'Could not create your account. Please try again.',
    };
  }

  const userId = created.user.id;
  await service.from('invites').update({ used_by: userId }).eq('id', invite.id);

  if (invite.role === 'admin') {
    await service.from('admins').insert({ user_id: userId });
  } else {
    await service.from('clients').update({ auth_user_id: userId, contact_email: email }).eq('id', invite.client_id).is('auth_user_id', null);
  }

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });

  redirect(invite.role === 'admin' ? '/admin' : '/dashboard');
}

// Always reports success, whether or not the email has an account, so this
// form can't be used to discover who is a NoirFlow client.
export async function requestPasswordReset(formData) {
  if (await isRateLimited('password-reset', 5)) {
    return { ok: false, error: 'Too many attempts. Wait 15 minutes and try again.' };
  }

  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: 'Enter a valid email address.' };

  const h = await headers();
  const origin = h.get('origin') || `https://${h.get('host')}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) console.error('[auth] resetPasswordForEmail failed:', error);

  return { ok: true };
}

export async function setNewPassword(formData) {
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirm_password') || '');

  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (password !== confirmPassword) return { ok: false, error: 'The two passwords don’t match.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Your reset link has expired. Request a new one.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error('[auth] updateUser (reset) failed:', error);
    return { ok: false, error: 'Could not update your password. Request a new reset link.' };
  }

  redirect(await homeFor(user.id));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
