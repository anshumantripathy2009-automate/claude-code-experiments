import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { getOrClaimClient, signOut } from './actions';
import ProfileForm from './ProfileForm';
import TicketForm from './TicketForm';

const STATUS_BADGE = {
  active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
  onboarding: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
  paused: 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-neutral-700',
};

const TICKET_STATUS_BADGE = {
  open: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  in_progress: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  resolved: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const client = await getOrClaimClient(user);

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-[10px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-6 text-center">
          <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">Account not set up yet</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2">
            We signed you in as <span className="font-medium text-neutral-900 dark:text-neutral-50">{user.email}</span>, but NoirFlow
            hasn&apos;t linked this email to a client account yet. Reach out and we&apos;ll get it set up.
          </p>
          <form action={signOut} className="mt-4">
            <button type="submit" className="text-xs font-semibold text-gray-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50">
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { data: tickets } = await supabase.from('tickets').select('*').eq('client_id', client.id).order('created_at', { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
      <header className="flex items-center justify-between py-5 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" />
              <path d="M8 14a6 6 0 0 0 8 0" />
              <path d="M12 20v-2" />
            </svg>
          </div>
          <span className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-neutral-50 tracking-tight">{client.business_name}</span>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-xs text-gray-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50">
            Sign out
          </button>
        </form>
      </header>

      <section className="pt-6 pb-2">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">Welcome back</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Your account, your automation, and a direct line to NoirFlow.</p>
      </section>

      {/* Account */}
      <section className="mt-4 rounded-[10px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">Your Account</h2>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${STATUS_BADGE[client.status] || STATUS_BADGE.onboarding}`}>
            {client.status}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <dt className="text-xs text-gray-500 dark:text-neutral-400">Plan</dt>
            <dd className="text-neutral-900 dark:text-neutral-50">{client.plan || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-neutral-400">Email</dt>
            <dd className="text-neutral-900 dark:text-neutral-50 truncate">{client.contact_email || user.email}</dd>
          </div>
        </dl>
        <ProfileForm client={client} />
      </section>

      {/* Automation */}
      <section className="mt-4 rounded-[10px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-3">Your Automation</h2>
        {client.dashboard_url ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-neutral-900 dark:text-neutral-50">{client.automation_type || 'AI automation'}</p>
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">See live bookings and conversations handled by your AI.</p>
            </div>
            <a
              href={client.dashboard_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Open dashboard →
            </a>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-neutral-400">Your automation dashboard link hasn&apos;t been added yet — ask NoirFlow.</p>
        )}
      </section>

      {/* New ticket */}
      <section className="mt-4 rounded-[10px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-3">Report an Issue or Request Something</h2>
        <TicketForm clientId={client.id} />
      </section>

      {/* Ticket history */}
      <section className="mt-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight mb-3">Your Requests</h2>
        {!tickets || tickets.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-neutral-400 rounded-[10px] border border-dashed border-gray-200 dark:border-neutral-800 p-6 text-center">
            Nothing submitted yet. Anything you report above will show up here.
          </p>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-[10px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">{t.subject}</p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0 ${TICKET_STATUS_BADGE[t.status]}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-400 line-clamp-2">{t.message}</p>
                <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-2">
                  {t.type === 'issue' ? 'Issue' : 'Request'} · {timeAgo(t.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-8 pt-5 border-t border-gray-200 dark:border-neutral-800 text-center">
        <p className="text-xs text-gray-400 dark:text-neutral-500">
          Powered by <span className="text-gray-500 dark:text-neutral-400 font-medium">NoirFlow AI</span>
        </p>
      </footer>
    </div>
  );
}
