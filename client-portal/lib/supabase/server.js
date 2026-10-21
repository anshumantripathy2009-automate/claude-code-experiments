// Server-side Supabase client for the App Router.
//
// Every query runs AS the logged-in user, so Row Level Security decides what
// they can see and change — clients get their own rows, admins (a row in
// `admins`) get everything. There is deliberately no service-role client in
// this app: the one operation that needs admin powers, creating an account
// from an invite code, runs in the `redeem-invite` Supabase Edge Function.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component where cookies can't be written —
          // safe to ignore as long as middleware.js is refreshing sessions.
        }
      },
    },
  });
}
