'use client';

import { useState } from 'react';
import { updateProfile } from './actions';

// Clients can edit their own contact details only — business_name,
// client_slug, plan, and status are set by NoirFlow during onboarding and
// stay read-only here (see the dashboard page for where those are shown).
export default function ProfileForm({ client }) {
  const [contactName, setContactName] = useState(client.contact_name || '');
  const [contactPhone, setContactPhone] = useState(client.contact_phone || '');
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');

    const formData = new FormData();
    formData.set('contact_name', contactName);
    formData.set('contact_phone', contactPhone);

    const result = await updateProfile(formData);
    if (result.ok) {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('error');
      setErrorMessage(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">Your name</label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="w-full text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-300 dark:focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">Phone number</label>
        <input
          type="tel"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="w-full text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-300 dark:focus:border-indigo-500"
        />
      </div>
      {status === 'error' && <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === 'saving'}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : 'Save changes'}
      </button>
    </form>
  );
}
