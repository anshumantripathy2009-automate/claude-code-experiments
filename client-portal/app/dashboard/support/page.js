import { createClient } from '../../../lib/supabase/server';
import { EmptyState, PageHeader, Section, TicketItem } from '../../../components/portal';
import { cardClass } from '../../../components/ui';
import TicketForm from './TicketForm';

export const metadata = { title: 'Support — NoirFlow Client Portal' };

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: tickets } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });

  return (
    <>
      <PageHeader title="Support" subtitle="Report a problem or ask for something new. Everything you send is tracked here until it’s resolved." />

      <div className={`p-4 sm:p-5 ${cardClass}`}>
        <TicketForm />
      </div>

      <Section title="Your requests">
        {tickets && tickets.length ? (
          <div className="space-y-2">
            {tickets.map((t) => (
              <TicketItem key={t.id} ticket={t} />
            ))}
          </div>
        ) : (
          <EmptyState>Nothing sent yet.</EmptyState>
        )}
      </Section>
    </>
  );
}
