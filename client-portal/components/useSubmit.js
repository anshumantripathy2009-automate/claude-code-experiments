'use client';

import { useState } from 'react';

// Tiny helper shared by every form: runs a server action with the form's
// data and tracks pending / error / done state. Server actions that succeed
// usually redirect, so "done" only shows for the ones that don't.
export function useSubmit(action, { resetOnSuccess = false } = {}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setError('');
    setDone(false);
    try {
      const outcome = await action(new FormData(form));
      if (outcome && outcome.ok === false) {
        setError(outcome.error || 'Something went wrong. Please try again.');
      } else if (outcome && outcome.ok) {
        setDone(true);
        setResult(outcome);
        if (resetOnSuccess) form.reset();
      }
    } finally {
      setPending(false);
    }
  }

  return { onSubmit, pending, error, done, result };
}
