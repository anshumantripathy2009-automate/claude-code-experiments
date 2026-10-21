'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Renders as a left sidebar on desktop and a horizontally scrolling tab row
// on mobile — same links, same order.
export default function Sidebar({ links }) {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-2 lg:pb-0">
      {links.map((link) => {
        const active = link.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 flex items-center justify-between gap-3 text-sm px-3 py-2 rounded-lg transition-colors ${
              active
                ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/10 dark:text-indigo-300'
                : 'text-gray-600 hover:bg-gray-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <span>{link.label}</span>
            {link.count > 0 && (
              <span className={`text-[11px] font-semibold px-1.5 rounded-md ${link.alert ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                {link.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
