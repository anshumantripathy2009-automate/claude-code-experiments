'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { normalizeInviteCode } from '../../lib/invite';
import { isRateLimited } from '../../lib/rateLimit';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCredentials(formData) {
  return {
    email: String(formData.get('email') || '').trim().toLowerCase(),
    password: String(formData.get('password') || ''),
  };
}

// Call right after signing in, on the same client, so is_admin() runs as
// the user who just logged in.
async function homeFor(supabase) {
  const { data } = await supabase.rpc('is_admin');
  return data === true ? '/admin' : '/dashboard';
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

  redirect(await homeFor(supabase));
}

// Redeems an invite code ("pass key") and creates the account. Accounts made
// any other way (e.g. directly against the Supabase API) have no client or
// admin link, so they can see nothing.
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

  // Account creation needs Supabase admin powers, so it happens inside the
  // `redeem-invite` Edge Function (supabase/functions/redeem-invite), which
  // re-validates everything and claims the code atomically.
  let result;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/redeem-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ code, email, password }),
      cache: 'no-store',
    });
    result = await response.json();
  } catch (error) {
    console.error('[auth] redeem-invite call failed:', error);
    return { ok: false, error: 'We couldn’t check your code right now. Please try again in a minute.' };
  }

  if (!result?.ok) {
    return { ok: false, error: result?.error || 'Could not create your account. Please try again.' };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.error('[auth] sign-in after signup failed:', signInError);
    redirect('/login');
  }

  redirect(result.role === 'admin' ? '/admin' : '/dashboard');
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
