// Browser-side Supabase client — uses the public, RLS-protected publishable
// key. Safe to ship in the JS bundle; every table it can touch (clients,
// tickets) has Row Level Security policies that scope reads/writes to the
// logged-in user's own data. Never import the service role key here.

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
