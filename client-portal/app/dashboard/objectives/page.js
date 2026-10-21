import { createClient } from '../../../lib/supabase/server';
import { EmptyState, ObjectiveCard, PageHeader } from '../../../components/portal';

export const metadata = { title: 'Objectives — NoirFlow Client Portal' };

export default async function ObjectivesPage() {
  const supabase = await createClient();
  const { data: objectives } = await supabase.from('objectives').select('*').order('created_at');

  return (
    <>
      <PageHeader title="Objectives" subtitle="The business results NoirFlow is working towards for you, and how close we are." />
      {objectives && objectives.length ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {objectives.map((o) => (
            <ObjectiveCard key={o.id} objective={o} />
          ))}
        </div>
      ) : (
        <EmptyState>NoirFlow will add the goals we’re working towards for you here.</EmptyState>
      )}
    </>
  );
}
