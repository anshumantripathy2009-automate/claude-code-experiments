import { cardClass } from './ui';

export function Logo() {
  return (
    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 4.9L5 10l5.1 2.1L12 17l1.9-4.9L19 10l-5.1-2.1Z" />
      </svg>
    </div>
  );
}

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`w-full max-w-sm p-6 ${cardClass}`}>
        <Logo />
        <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mt-4">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-5 pt-4 border-t border-gray-100 dark:border-neutral-800 text-xs text-gray-500 dark:text-neutral-400">{footer}</div>}
      </div>
    </div>
  );
}
