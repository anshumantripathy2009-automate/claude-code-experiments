import Link from 'next/link';
import { createClient } from '../../lib/supabase/server';
import { requireAdmin } from '../../lib/portal';
import { CLIENT_STATUS, SERVICE_STATUS, formatDate, timeAgo } from '../../lib/format';
import { signOut } from '../auth/actions';
import { EmptyState, PageHeader, Section, StatCard, StatusBadge, TicketItem } from '../../components/portal';
import { Logo } from '../../components/AuthCard';
import { cardClass, inputClass } from '../../components/ui';
import { resolveError, updateObjective, updateServiceStatus, updateTicketStatus } from './actions';
import { AddObjectiveForm, AddServiceForm, AdminInviteForm, CreateClientForm, LogEventForm, RegenerateInviteButton } from './AdminForms';

export const metadata = { title: 'Admin — NoirFlow Client Portal' };

const smallSelect = `${inputClass} !w-auto !py-1 text-xs`;
const smallButton = 'text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800';

function Panel({ children }) {
  return <div className={`p-4 sm:p-5 ${cardClass}`}>{children}</div>;
}

export default async function AdminPage() {
  const user = await requireAdmin();
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [{ data: clients }, { data: services }, { data: objectives }, { data: invites }, { data: tickets }, { data: openErrors }] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('services').select('*').order('created_at'),
    supabase.from('objectives').select('*').order('created_at'),
    supabase.from('invites').select('client_id, expires_at').eq('role', 'client').is('used_at', null).gt('expires_at', nowIso),
    supabase.from('tickets').select('*').neq('status', 'resolved').order('created_at', { ascending: false }),
    supabase.from('service_events').select('*').eq('kind', 'error').is('resolved_at', null).order('created_at', { ascending: false }),
  ]);

  const clientList = clients || [];
  const serviceList = services || [];
  const clientsById = Object.fromEntries(clientList.map((c) => [c.id, c]));
  const pendingInviteByClient = Object.fromEntries((invites || []).map((i) => [i.client_id, i]));
  const clientOptions = clientList.map((c) => ({ id: c.id, business_name: c.business_name }));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="scale-90"><Logo /></div>
            <div>
              <p className="text-sm font-semibold">NoirFlow Admin</p>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">{user.email}</p>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className={smallButton}>Sign out</button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-16">
        <PageHeader title="Client operations" subtitle="Onboard clients, track their services and goals, and handle what they send you." />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Clients" value={clientList.length} hint={`${clientList.filter((c) => c.status === 'active').length} active`} />
          <StatCard label="Services running" value={serviceList.filter((s) => s.status === 'active').length} hint={`${serviceList.length} total`} />
          <StatCard label="Open tickets" value={(tickets || []).length} tone={(tickets || []).length ? 'alert' : 'good'} />
          <StatCard label="Open errors" value={(openErrors || []).length} tone={(openErrors || []).length ? 'alert' : 'good'} />
        </div>

        {/* Needs attention first: what clients are waiting on. */}
        <div className="grid lg:grid-cols-2 gap-x-6">
          <Section title="Open tickets">
            {tickets && tickets.length ? (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <TicketItem
                    key={t.id}
                    ticket={t}
                    extra={
                      <form action={updateTicketStatus.bind(null, t.id)} className="flex items-center gap-2 mt-3">
                        <span className="text-[11px] text-gray-500 dark:text-neutral-400 mr-auto">{clientsById[t.client_id]?.business_name}</span>
                        <select name="status" defaultValue={t.status} className={smallSelect}>
                          <option value="open">Open</option>
                          <option value="in_progress">In progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button type="submit" className={smallButton}>Update</button>
                      </form>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState>No open tickets.</EmptyState>
            )}
          </Section>

          <Section title="Open errors">
            {openErrors && openErrors.length ? (
              <div className="space-y-2">
                {openErrors.map((e) => (
                  <div key={e.id} className={`p-4 ${cardClass}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{e.title}</p>
                      <span className="text-[11px] font-medium text-red-600 dark:text-red-400 shrink-0">{e.severity}</span>
                    </div>
                    {e.detail && <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 whitespace-pre-line">{e.detail}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] text-gray-400 dark:text-neutral-500">
                        {clientsById[e.client_id]?.business_name} · {timeAgo(e.created_at)}
                      </span>
                      <form action={resolveError.bind(null, e.id)}>
                        <button type="submit" className={smallButton}>Mark fixed</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>No open errors across any client.</EmptyState>
            )}
          </Section>
        </div>

        <Section title="Clients">
          {clientList.length ? (
            <div className="space-y-2">
              {clientList.map((c) => {
                const clientServices = serviceList.filter((s) => s.client_id === c.id);
                const pendingInvite = pendingInviteByClient[c.id];
                return (
                  <Panel key={c.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{c.business_name}</p>
                          <StatusBadge map={CLIENT_STATUS} value={c.status} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                          {c.client_slug} · {c.plan || 'No plan set'} · since {formatDate(c.created_at)}
                        </p>
                        <p className="text-xs mt-1">
                          {c.auth_user_id ? (
                            <span className="text-emerald-600 dark:text-emerald-400">Account active · {c.contact_email}</span>
                          ) : pendingInvite ? (
                            <span className="text-amber-600 dark:text-amber-400">Invite sent · expires {formatDate(pendingInvite.expires_at)}</span>
                          ) : (
                            <span className="text-gray-500 dark:text-neutral-400">No account yet, no active invite</span>
                          )}
                        </p>
                      </div>
                      {!c.auth_user_id && <RegenerateInviteButton clientId={c.id} />}
                    </div>
                    {clientServices.length > 0 && (
                      <ul className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800 space-y-2">
                        {clientServices.map((s) => (
                          <li key={s.id} className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium mr-auto">
                              {s.name} <span className="text-gray-400 dark:text-neutral-500 font-mono">{s.slug}</span>
                            </span>
                            <StatusBadge map={SERVICE_STATUS} value={s.status} />
                            <form action={updateServiceStatus.bind(null, s.id)} className="flex items-center gap-1">
                              <select name="status" defaultValue={s.status} className={smallSelect}>
                                <option value="setup">Setting up</option>
                                <option value="active">Active</option>
                                <option value="issue">Issue</option>
                                <option value="paused">Paused</option>
                              </select>
                              <button type="submit" className={smallButton}>Set</button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>
                );
              })}
            </div>
          ) : (
            <EmptyState>No clients yet. Create your first one below.</EmptyState>
          )}
        </Section>

        <Section title="Onboard a new client">
          <Panel>
            <CreateClientForm />
          </Panel>
        </Section>

        <div className="grid lg:grid-cols-2 gap-x-6">
          <Section title="Log an update, operation or error">
            <Panel>
              {clientOptions.length ? <LogEventForm clients={clientOptions} services={serviceList} /> : <p className="text-sm text-gray-500">Add a client first.</p>}
            </Panel>
          </Section>
          <Section title="Add a service">
            <Panel>
              {clientOptions.length ? <AddServiceForm clients={clientOptions} /> : <p className="text-sm text-gray-500">Add a client first.</p>}
            </Panel>
          </Section>
        </div>

        <div className="grid lg:grid-cols-2 gap-x-6">
          <Section title="Add an objective">
            <Panel>
              {clientOptions.length ? <AddObjectiveForm clients={clientOptions} /> : <p className="text-sm text-gray-500">Add a client first.</p>}
            </Panel>
          </Section>
          <Section title="Update objectives">
            {objectives && objectives.length ? (
              <div className="space-y-2">
                {objectives.map((o) => (
                  <Panel key={o.id}>
                    <p className="text-sm font-medium">{o.title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400">{clientsById[o.client_id]?.business_name}</p>
                    <form action={updateObjective.bind(null, o.id)} className="flex flex-wrap items-center gap-2 mt-3">
                      <input
                        name="current_value"
                        type="number"
                        min="0"
                        step="any"
                        defaultValue={o.current_value}
                        className={`${inputClass} !w-24 !py-1 text-xs`}
                        aria-label="Current value"
                      />
                      <span className="text-xs text-gray-500 dark:text-neutral-400">
                        / {o.target_value ?? '—'} {o.unit || ''}
                      </span>
                      <select name="status" defaultValue={o.status} className={smallSelect}>
                        <option value="on_track">On track</option>
                        <option value="at_risk">At risk</option>
                        <option value="achieved">Achieved</option>
                      </select>
                      <button type="submit" className={smallButton}>Save</button>
                    </form>
                  </Panel>
                ))}
              </div>
            ) : (
              <EmptyState>No objectives yet.</EmptyState>
            )}
          </Section>
        </div>

        <Section title="Add a NoirFlow team member">
          <Panel>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mb-3">Creates an admin invite locked to one email. Only give this to people who should see every client.</p>
            <AdminInviteForm />
          </Panel>
        </Section>

        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-8">
          Want to see what a client sees? Create a test client, redeem its invite with a second email at <Link href="/signup" className="underline">/signup</Link>.
        </p>
      </main>
    </div>
  );
}
