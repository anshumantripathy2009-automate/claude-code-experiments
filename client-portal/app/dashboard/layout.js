import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getClient, getUser, isAdmin } from '../../lib/portal';
import { signOut } from '../auth/actions';
import Sidebar from '../../components/Sidebar';
import { Logo } from '../../components/AuthCard';
import { cardClass } from '../../components/ui';

export default async function DashboardLayout({ children }) {
  const user = await getUser();
  if (!user) redirect('/login');

  const client = await getClient();

  if (!client) {
    if (await isAdmin()) redirect('/admin');
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-sm p-6 text-center ${cardClass}`}>
          <h1 className="text-base font-semibold">Account not linked yet</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2">
            You’re signed in as <span className="font-medium text-neutral-900 dark:text-neutral-50">{user.email}</span>, but this login
            isn’t connected to a NoirFlow client account. Contact NoirFlow and we’ll sort it out.
          </p>
          <form action={signOut} className="mt-4">
            <button type="submit" className="text-xs font-semibold text-gray-500 hover:text-neutral-900 dark:hover:text-neutral-50">Sign out</button>
          </form>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ count: openErrors }, { count: openTickets }] = await Promise.all([
    supabase.from('service_events').select('id', { count: 'exact', head: true }).eq('kind', 'error').is('resolved_at', null),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).neq('status', 'resolved'),
  ]);

  const links = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/services', label: 'Services' },
    { href: '/dashboard/activity', label: 'Activity & Errors', count: openErrors || 0, alert: true },
    { href: '/dashboard/objectives', label: 'Objectives' },
    { href: '/dashboard/support', label: 'Support', count: openTickets || 0 },
    { href: '/dashboard/account', label: 'Account' },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="scale-90"><Logo /></div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight truncate">{client.business_name}</p>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">NoirFlow Client Portal</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-500 dark:text-neutral-400 truncate max-w-[200px]">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
        <aside className="mb-4 lg:mb-0">
          <div className="lg:sticky lg:top-24">
            <Sidebar links={links} />
          </div>
        </aside>
        <main className="min-w-0 pb-16">{children}</main>
      </div>
    </div>
  );
}
