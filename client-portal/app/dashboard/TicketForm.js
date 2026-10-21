'use client';

import { useState } from 'react';
import { createTicket } from './actions';

export default function TicketForm({ clientId }) {
  const [type, setType] = useState('issue');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    const formData = new FormData();
    formData.set('type', type);
    formData.set('subject', subject);
    formData.set('message', message);

    const result = await createTicket(clientId, formData);
    if (result.ok) {
      setStatus('sent');
      setSubject('');
      setMessage('');
      setTimeout(() => setStatus('idle'), 2500);
    } else {
      setStatus('error');
      setErrorMessage(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('issue')}
          className={`flex-1 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
            type === 'issue'
              ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400'
              : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-neutral-400'
          }`}
        >
          Something&apos;s wrong
        </button>
        <button
          type="button"
          onClick={() => setType('request')}
          className={`flex-1 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
            type === 'request'
              ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
              : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-neutral-400'
          }`}
        >
          Request something
        </button>
      </div>
      <input
        type="text"
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder={type === 'issue' ? "What's wrong, in a few words?" : 'What do you need?'}
        className="w-full text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-300 dark:focus:border-indigo-500"
      />
      <textarea
        required
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Details..."
        className="w-full text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-300 dark:focus:border-indigo-500 resize-none"
      />
      {status === 'error' && <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent ✓' : 'Submit'}
      </button>
    </form>
  );
}
