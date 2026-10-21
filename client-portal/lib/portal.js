// Shared "who is this and what can they see" lookups for server components.
// Wrapped in React's cache() so the dashboard layout and the page inside it
// share one lookup per request instead of hitting Supabase twice.

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from './supabase/server';

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Runs as the logged-in user, so RLS guarantees this can only ever return
// the client row that belongs to them.
export const getClient = cache(async () => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from('clients').select('*').eq('auth_user_id', user.id).maybeSingle();
  return data;
});

export const isAdmin = cache(async () => {
  const user = await getUser();
  if (!user) return false;
  const service = createServiceClient();
  const { data } = await service.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  return Boolean(data);
});

// Every admin page and every admin server action calls this first. Server
// actions are public POST endpoints, so the check has to live in the action
// itself — hiding the admin link in the UI protects nothing.
export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect('/login');
  if (!(await isAdmin())) redirect('/dashboard');
  return user;
}
