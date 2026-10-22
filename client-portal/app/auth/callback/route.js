// Handles links from Supabase emails (currently: password reset). Exchanges
// the one-time code for a session, then sends the user to `next`.

import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

// Only same-site paths — never let `next` send someone to another domain.
function safeNextPath(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('[auth/callback] exchangeCodeForSession failed:', error);
  }

  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}
