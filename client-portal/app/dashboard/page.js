import Link from 'next/link';
import { createClient } from '../../lib/supabase/server';
import { getClient } from '../../lib/portal';
import { CLIENT_STATUS } from '../../lib/format';
import { EmptyState, EventList, ObjectiveCard, PageHeader, Section, ServiceCard, StatCard, StatusBadge, TicketItem } from '../../components/portal';

export const metadata = { title: 'Overview — NoirFlow Client Portal' };

const linkClass = 'text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline';

export default async function OverviewPage() {
  const client = await getClient();
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Every query runs as the logged-in client, so RLS scopes all of this to
  // their own rows without a client_id filter having to be trusted.
  const [{ data: services }, { data: objectives }, { data: recentEvents }, { data: openTickets }, { count: openErrors }, { count: opsThisWeek }] =
    await Promise.all([
      supabase.from('services').select('*').order('created_at'),
      supabase.from('objectives').select('*').order('created_at'),
      supabase.from('service_events').select('*').order('created_at', { ascending: false }).limit(6),
      supabase.from('tickets').select('*').neq('status', 'resolved').order('created_at', { ascending: false }).limit(3),
      supabase.from('service_events').select('id', { count: 'exact', head: true }).eq('kind', 'error').is('resolved_at', null),
      supabase.from('service_events').select('id', { count: 'exact', head: true }).eq('kind', 'operation').gte('created_at', weekAgo),
    ]);

  const servicesList = services || [];
  const objectivesList = objectives || [];
  const servicesById = Object.fromEntries(servicesList.map((s) => [s.id, s]));
  const activeServices = servicesList.filter((s) => s.status === 'active').length;
  const healthyObjectives = objectivesList.filter((o) => o.status !== 'at_risk').length;

  return (
    <>
      <PageHeader
        title={`Welcome${client.contact_name ? `, ${client.contact_name.split(' ')[0]}` : ''}`}
        subtitle="Everything NoirFlow is running for your business, in one place."
        action={
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
            {client.plan && <span>{client.plan}</span>}
            <StatusBadge map={CLIENT_STATUS} value={client.status} />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active services" value={`${activeServices}/${servicesList.length}`} hint="Running right now" />
        <StatCard label="Open errors" value={openErrors || 0} tone={openErrors ? 'alert' : 'good'} hint={openErrors ? 'NoirFlow is on it' : 'All clear'} />
        <StatCard label="Objectives on track" value={`${healthyObjectives}/${objectivesList.length}`} hint="On track or achieved" />
        <StatCard label="Operations this week" value={opsThisWeek || 0} hint="Handled by your automations" />
      </div>

      <div className="grid lg:grid-cols-2 gap-x-6">
        <Section title="Recent activity" action={<Link href="/dashboard/activity" className={linkClass}>View all</Link>}>
          {recentEvents && recentEvents.length ? (
            <EventList events={recentEvents} servicesById={servicesById} />
          ) : (
            <EmptyState>No activity yet. Operations and errors from your automations will appear here as they happen.</EmptyState>
          )}
        </Section>

        <Section title="Objectives" action={<Link href="/dashboard/objectives" className={linkClass}>View all</Link>}>
          {objectivesList.length ? (
            <div className="space-y-3">
              {objectivesList.slice(0, 3).map((o) => (
                <ObjectiveCard key={o.id} objective={o} />
              ))}
            </div>
          ) : (
            <EmptyState>NoirFlow will add the goals we’re working towards for you here.</EmptyState>
          )}
        </Section>
      </div>

      <Section title="Your services" action={<Link href="/dashboard/services" className={linkClass}>View all</Link>}>
        {servicesList.length ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {servicesList.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <EmptyState>Your services will appear here once NoirFlow sets them up.</EmptyState>
        )}
      </Section>

      <Section title="Open requests" action={<Link href="/dashboard/support" className={linkClass}>Report an issue</Link>}>
        {openTickets && openTickets.length ? (
          <div className="space-y-2">
            {openTickets.map((t) => (
              <TicketItem key={t.id} ticket={t} />
            ))}
          </div>
        ) : (
          <EmptyState>No open requests. Something wrong, or need something new? Use Support.</EmptyState>
        )}
      </Section>
    </>
  );
}
