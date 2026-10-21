'use client';

import Link from 'next/link';
import { signIn } from '../auth/actions';
import { useSubmit } from '../../components/useSubmit';
import { inputClass, labelClass, primaryButtonClass } from '../../components/ui';

export default function LoginForm() {
  const { onSubmit, pending, error } = useSubmit(signIn);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className={labelClass}>Password</label>
          <Link href="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mb-1">Forgot?</Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <button type="submit" disabled={pending} className={`w-full ${primaryButtonClass}`}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
