'use client';

import Link from 'next/link';
import AuthCard from '../../components/AuthCard';
import { requestPasswordReset } from '../auth/actions';
import { useSubmit } from '../../components/useSubmit';
import { inputClass, labelClass, primaryButtonClass } from '../../components/ui';

export default function ForgotPasswordPage() {
  const { onSubmit, pending, error, done } = useSubmit(requestPasswordReset);

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We’ll email you a link to choose a new one."
      footer={<Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Back to sign in</Link>}
    >
      {done ? (
        <p className="text-sm text-gray-600 dark:text-neutral-300">
          If that email has a NoirFlow account, a reset link is on its way. Check your inbox (and spam folder).
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" disabled={pending} className={`w-full ${primaryButtonClass}`}>
            {pending ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
