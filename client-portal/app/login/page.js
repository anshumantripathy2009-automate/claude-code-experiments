'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus('sending');
    setErrorMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage('Could not send the login link. Please try again in a moment.');
      return;
    }
    setStatus('sent');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[10px] border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-6">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" />
            <path d="M8 14a6 6 0 0 0 8 0" />
            <path d="M12 20v-2" />
          </svg>
        </div>
        <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">NoirFlow Client Portal</h1>

        {status === 'sent' ? (
          <p className="text-sm text-gray-600 dark:text-neutral-300 mt-2">
            Check your inbox — we sent a login link to <span className="font-medium text-neutral-900 dark:text-neutral-50">{email}</span>. Click it on this device to sign in.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 mb-4">
              Enter your email and we&apos;ll send you a one-click login link — no password needed.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                className="w-full text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-800 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-300 dark:focus:border-indigo-500"
              />
              {status === 'error' && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{errorMessage}</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full mt-4 text-sm font-semibold px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {status === 'sending' ? 'Sending...' : 'Send login link'}
              </button>
            </form>
          </>
        )}
        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-4">Not a NoirFlow client yet? Ask about our automation plans.</p>
      </div>
    </div>
  );
}
