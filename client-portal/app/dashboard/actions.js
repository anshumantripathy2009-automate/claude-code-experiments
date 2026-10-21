'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '../../lib/supabase/server';

const TICKET_SUBJECT_MAX = 200;
const TICKET_MESSAGE_MAX = 4000;

// Links a freshly-authenticated user to their pre-existing `clients` row.
// NoirFlow onboards a new client by inserting a `clients` row with their
// contact_email and auth_user_id left NULL (see README "Onboarding a new
// client"). The first time that person logs in, this claims the row —
// using the service client because RLS intentionally has no policy that
// lets an anon/authenticated user set their own auth_user_id (that would
// let anyone claim anyone else's row just by knowing their email).
export async function getOrClaimClient(user) {
  const supabase = await createClient();

  const { data: owned } = await supabase.from('clients').select('*').eq('auth_user_id', user.id).maybeSingle();
  if (owned) return owned;

  if (!user.email) return null;

  const service = createServiceClient();
  const { data: unclaimed } = await service
    .from('clients')
    .select('id')
    .eq('contact_email', user.email)
    .is('auth_user_id', null)
    .maybeSingle();

  if (!unclaimed) return null;

  const { data: claimed, error } = await service
    .from('clients')
    .update({ auth_user_id: user.id })
    .eq('id', unclaimed.id)
    .select()
    .single();

  if (error) {
    console.error('[actions] Failed to claim client row:', error);
    return null;
  }
  return claimed;
}

export async function updateProfile(formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const contactName = String(formData.get('contact_name') || '').trim().slice(0, 200);
  const contactPhone = String(formData.get('contact_phone') || '').trim().slice(0, 20);

  const { error } = await supabase
    .from('clients')
    .update({ contact_name: contactName || null, contact_phone: contactPhone || null, updated_at: new Date().toISOString() })
    .eq('auth_user_id', user.id);

  if (error) {
    console.error('[actions] Failed to update profile:', error);
    return { ok: false, error: 'Could not save your changes. Please try again.' };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function createTicket(clientId, formData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const type = formData.get('type') === 'request' ? 'request' : 'issue';
  const subject = String(formData.get('subject') || '').trim().slice(0, TICKET_SUBJECT_MAX);
  const message = String(formData.get('message') || '').trim().slice(0, TICKET_MESSAGE_MAX);

  if (!subject || !message) {
    return { ok: false, error: 'Please fill in both a subject and a message.' };
  }

  // RLS (see migration) only allows inserting a ticket whose client_id
  // resolves back to this user's own `clients` row — this clientId param
  // is just which row to attach to, not a trust boundary by itself.
  const { error } = await supabase.from('tickets').insert({ client_id: clientId, type, subject, message });

  if (error) {
    console.error('[actions] Failed to create ticket:', error);
    return { ok: false, error: 'Could not submit that. Please try again.' };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
