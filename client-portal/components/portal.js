// Display building blocks shared by the client dashboard and admin console.
// Server-safe (no hooks), so pages can render them directly.

import { badgeClass, cardClass } from './ui';
import { EVENT_KIND, OBJECTIVE_STATUS, SERVICE_STATUS, TICKET_STATUS, formatDate, progressPercent, timeAgo } from '../lib/format';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Section({ title, action, children }) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, tone = 'default' }) {
  const valueColor = tone === 'alert' ? 'text-red-600 dark:text-red-400' : tone === 'good' ? 'text-emerald-600 dark:text-emerald-400' : '';
  return (
    <div className={`p-4 sm:p-5 ${cardClass}`}>
      <p className="text-xs font-medium text-gray-500 dark:text-neutral-400">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold tracking-tight mt-2 ${valueColor}`}>{value}</p>
      {hint && <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">{hint}</p>}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <p className="text-sm text-gray-500 dark:text-neutral-400 rounded-[10px] border border-dashed border-gray-200 dark:border-neutral-800 p-6 text-center">
      {children}
    </p>
  );
}

export function StatusBadge({ map, value }) {
  const entry = map[value] || { label: value, className: '' };
  return <span className={`${badgeClass} border ${entry.className}`}>{entry.label}</span>;
}

export function ServiceCard({ service, eventCount }) {
  return (
    <div className={`p-4 sm:p-5 ${cardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{service.name}</p>
          {service.service_type && <p className="text-xs text-gray-500 dark:text-neutral-400">{service.service_type}</p>}
        </div>
        <StatusBadge map={SERVICE_STATUS} value={service.status} />
      </div>
      {service.description && <p className="text-sm text-gray-600 dark:text-neutral-300 mt-3">{service.description}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-xs text-gray-500 dark:text-neutral-400">
        <span>
          Live since {formatDate(service.started_at)}
          {typeof eventCount === 'number' && ` · ${eventCount} logged events`}
        </span>
        {service.dashboard_url && (
          <a href={service.dashboard_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Open live dashboard →
          </a>
        )}
      </div>
    </div>
  );
}

export function EventItem({ event, serviceName }) {
  const kind = EVENT_KIND[event.kind] || EVENT_KIND.operation;
  const isOpenError = event.kind === 'error' && !event.resolved_at;
  return (
    <li className="flex gap-3 py-3">
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${kind.dot}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-medium">{event.title}</p>
          {event.kind === 'error' && (
            <span className={`${badgeClass} ${isOpenError ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
              {isOpenError ? (event.severity === 'critical' ? 'Critical · open' : 'Open') : 'Fixed'}
            </span>
          )}
        </div>
        {event.detail && <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 whitespace-pre-line">{event.detail}</p>}
        <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
          {kind.label}
          {serviceName && ` · ${serviceName}`} · {timeAgo(event.created_at)}
        </p>
      </div>
    </li>
  );
}

export function EventList({ events, servicesById }) {
  return (
    <ul className={`px-4 sm:px-5 divide-y divide-gray-100 dark:divide-neutral-800 ${cardClass}`}>
      {events.map((e) => (
        <EventItem key={e.id} event={e} serviceName={servicesById?.[e.service_id]?.name} />
      ))}
    </ul>
  );
}

export function ObjectiveCard({ objective }) {
  const status = OBJECTIVE_STATUS[objective.status] || OBJECTIVE_STATUS.on_track;
  const pct = progressPercent(objective.current_value, objective.target_value);
  const unit = objective.unit ? ` ${objective.unit}` : '';
  return (
    <div className={`p-4 sm:p-5 ${cardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold">{objective.title}</p>
        <span className={`${badgeClass} shrink-0 ${status.className}`}>{status.label}</span>
      </div>
      {objective.description && <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{objective.description}</p>}
      {objective.target_value ? (
        <>
          <div className="mt-4 h-2 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
            <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-neutral-400">
            <span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">{Number(objective.current_value).toLocaleString('en-IN')}</span> /{' '}
              {Number(objective.target_value).toLocaleString('en-IN')}
              {unit}
            </span>
            <span>{pct}%</span>
          </div>
        </>
      ) : null}
      {objective.due_date && <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-2">Target date: {formatDate(objective.due_date)}</p>}
    </div>
  );
}

export function TicketItem({ ticket, extra }) {
  const status = TICKET_STATUS[ticket.status] || TICKET_STATUS.open;
  return (
    <div className={`p-4 ${cardClass}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{ticket.subject}</p>
        <span className={`${badgeClass} shrink-0 ${status.className}`}>{status.label}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 whitespace-pre-line">{ticket.message}</p>
      <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-2">
        {ticket.type === 'issue' ? 'Issue' : 'Request'} · {timeAgo(ticket.created_at)}
      </p>
      {extra}
    </div>
  );
}
