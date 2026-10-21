// Server-side Supabase clients for the App Router.
//
// Two different clients on purpose:
//   - createClient()        — runs AS the logged-in user (RLS applies).
//     Use this for anything the user themselves should be allowed to do.
//   - createServiceClient() — runs as service_role (RLS bypassed).
//     Use this ONLY for privileged operations the client-portal itself must
//     do on the user's behalf — e.g. linking a freshly-created auth user to
//     their pre-existing `clients` row on first login. Never use this to
//     skip writing a proper RLS policy just because it's more convenient.

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

let serviceClient = null;

export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env file (server-only, never NEXT_PUBLIC_).');
  }
  if (!serviceClient) {
    serviceClient = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}
