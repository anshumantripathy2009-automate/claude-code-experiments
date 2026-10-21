export function timeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function progressPercent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((Number(current) / Number(target)) * 100));
}

export const SERVICE_STATUS = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  setup: { label: 'Setting up', className: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' },
  issue: { label: 'Issue', className: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' },
  paused: { label: 'Paused', className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700' },
};

export const CLIENT_STATUS = {
  active: SERVICE_STATUS.active,
  onboarding: { label: 'Onboarding', className: SERVICE_STATUS.setup.className },
  paused: SERVICE_STATUS.paused,
};

export const OBJECTIVE_STATUS = {
  on_track: { label: 'On track', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', bar: 'bg-emerald-500' },
  at_risk: { label: 'At risk', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', bar: 'bg-amber-500' },
  achieved: { label: 'Achieved', className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400', bar: 'bg-indigo-600' },
};

export const TICKET_STATUS = {
  open: { label: 'Open', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  in_progress: { label: 'In progress', className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' },
  resolved: { label: 'Resolved', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
};

export const EVENT_KIND = {
  operation: { label: 'Operation', dot: 'bg-emerald-500' },
  update: { label: 'Update from NoirFlow', dot: 'bg-indigo-500' },
  error: { label: 'Error', dot: 'bg-red-500' },
};
