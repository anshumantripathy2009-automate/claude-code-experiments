'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getClient, getUser } from '../../lib/portal';

const MIN_PASSWORD_LENGTH = 8;

// All of these run as the logged-in user (not the service role), so Row
// Level Security and the column grants in the migration are what actually
// stop a client from touching anything that isn't theirs.

export async function updateProfile(formData) {
  const user = await getUser();
  if (!user) redirect('/login');

  const contactName = String(formData.get('contact_name') || '').trim().slice(0, 200);
  const contactPhone = String(formData.get('contact_phone') || '').trim().slice(0, 20);

  const supabase = await createClient();
  const { error } = await supabase
    .from('clients')
    .update({ contact_name: contactName || null, contact_phone: contactPhone || null, updated_at: new Date().toISOString() })
    .eq('auth_user_id', user.id);

  if (error) {
    console.error('[dashboard] updateProfile failed:', error);
    return { ok: false, error: 'Could not save your changes. Please try again.' };
  }
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}

export async function changePassword(formData) {
  const user = await getUser();
  if (!user) redirect('/login');

  const currentPassword = String(formData.get('current_password') || '');
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirm_password') || '');

  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  if (password !== confirmPassword) return { ok: false, error: 'The two new passwords don’t match.' };

  const supabase = await createClient();

  // Re-check the current password first, so someone who finds an unlocked
  // laptop with the portal open can't silently take over the account.
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
  if (verifyError) return { ok: false, error: 'Your current password is incorrect.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error('[dashboard] changePassword failed:', error);
    return { ok: false, error: 'Could not change your password. Please try again.' };
  }
  return { ok: true };
}

export async function createTicket(formData) {
  const client = await getClient();
  if (!client) redirect('/login');

  const type = formData.get('type') === 'request' ? 'request' : 'issue';
  const subject = String(formData.get('subject') || '').trim().slice(0, 200);
  const message = String(formData.get('message') || '').trim().slice(0, 4000);

  if (!subject || !message) return { ok: false, error: 'Please add a subject and some details.' };

  // client.id comes from getClient(), which is RLS-scoped to this user —
  // never from the form — so a client can't file tickets on someone else.
  const supabase = await createClient();
  const { error } = await supabase.from('tickets').insert({ client_id: client.id, type, subject, message });

  if (error) {
    console.error('[dashboard] createTicket failed:', error);
    return { ok: false, error: 'Could not send that. Please try again.' };
  }
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}
