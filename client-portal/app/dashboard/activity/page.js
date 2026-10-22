import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import { EmptyState, EventList, PageHeader } from '../../../components/portal';

export const metadata = { title: 'Activity & Errors — NoirFlow Client Portal' };

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'operation', label: 'Operations' },
  { key: 'error', label: 'Errors' },
  { key: 'update', label: 'Updates from NoirFlow' },
];

export default async function ActivityPage({ searchParams }) {
  const filter = FILTERS.some((f) => f.key === searchParams?.filter) ? searchParams.filter : 'all';

  const supabase = await createClient();
  let query = supabase.from('service_events').select('*').order('created_at', { ascending: false }).limit(100);
  if (filter !== 'all') query = query.eq('kind', filter);

  const [{ data: events }, { data: services }] = await Promise.all([query, supabase.from('services').select('id, name')]);
  const servicesById = Object.fromEntries((services || []).map((s) => [s.id, s]));

  return (
    <>
      <PageHeader title="Activity & Errors" subtitle="A running log of what your automations did, what went wrong, and what NoirFlow changed." />

      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/dashboard/activity' : `/dashboard/activity?filter=${f.key}`}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              filter === f.key
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {events && events.length ? (
        <EventList events={events} servicesById={servicesById} />
      ) : (
        <EmptyState>{filter === 'error' ? 'No errors logged. 🎉' : 'Nothing logged here yet.'}</EmptyState>
      )}
    </>
  );
}
