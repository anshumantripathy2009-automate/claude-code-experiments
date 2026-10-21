'use client';

import { useState } from 'react';
import { createTicket } from '../actions';
import { useSubmit } from '../../../components/useSubmit';
import { inputClass, primaryButtonClass } from '../../../components/ui';

const TYPES = [
  { value: 'issue', label: 'Something’s wrong', active: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400' },
  { value: 'request', label: 'Request something new', active: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400' },
];

export default function TicketForm() {
  const [type, setType] = useState('issue');
  const { onSubmit, pending, error, done } = useSubmit(createTicket, { resetOnSuccess: true });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="type" value={type} />
      <div className="grid grid-cols-2 gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
              type === t.value ? t.active : 'border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-neutral-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <input
        name="subject"
        required
        maxLength={200}
        placeholder={type === 'issue' ? 'What’s wrong, in a few words?' : 'What would you like?'}
        className={inputClass}
      />
      <textarea
        name="message"
        required
        rows={4}
        maxLength={4000}
        placeholder={type === 'issue' ? 'What happened, when, and what did you expect instead?' : 'Describe what you need and why.'}
        className={`${inputClass} resize-none`}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {done && <p className="text-xs text-emerald-600 dark:text-emerald-400">Sent. NoirFlow will pick this up and update its status below.</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Sending…' : 'Send to NoirFlow'}
      </button>
    </form>
  );
}
