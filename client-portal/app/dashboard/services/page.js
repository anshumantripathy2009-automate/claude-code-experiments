import { createClient } from '../../../lib/supabase/server';
import { EmptyState, EventList, PageHeader, Section, ServiceCard } from '../../../components/portal';

export const metadata = { title: 'Services — NoirFlow Client Portal' };

export default async function ServicesPage() {
  const supabase = await createClient();
  const [{ data: services }, { data: events }] = await Promise.all([
    supabase.from('services').select('*').order('created_at'),
    supabase.from('service_events').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  const servicesList = services || [];
  const eventsList = events || [];

  return (
    <>
      <PageHeader title="Services" subtitle="Each automation and system NoirFlow runs for you, with its latest activity." />

      {servicesList.length === 0 ? (
        <EmptyState>Your services will appear here once NoirFlow sets them up.</EmptyState>
      ) : (
        servicesList.map((service) => {
          const serviceEvents = eventsList.filter((e) => e.service_id === service.id);
          return (
            <Section key={service.id} title={service.name}>
              <ServiceCard service={service} eventCount={serviceEvents.length} />
              {serviceEvents.length > 0 && (
                <div className="mt-3">
                  <EventList events={serviceEvents.slice(0, 5)} />
                </div>
              )}
            </Section>
          );
        })
      )}
    </>
  );
}
