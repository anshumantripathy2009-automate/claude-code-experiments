// Shared Tailwind class strings so every form and card looks the same.
// Kept as plain strings (not a component library) on purpose — easy to read,
// nothing extra to install.

export const inputClass =
  'w-full text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-300 dark:focus:border-indigo-500';

export const labelClass = 'block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1';

export const primaryButtonClass =
  'text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors';

export const cardClass = 'rounded-[10px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm';

export const badgeClass = 'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md';
