'use client';

import AuthCard from '../../components/AuthCard';
import { setNewPassword } from '../auth/actions';
import { useSubmit } from '../../components/useSubmit';
import { inputClass, labelClass, primaryButtonClass } from '../../components/ui';

export default function ResetPasswordPage() {
  const { onSubmit, pending, error } = useSubmit(setNewPassword);

  return (
    <AuthCard title="Choose a new password" subtitle="You’ll be signed in right after.">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="password" className={labelClass}>New password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="confirm_password" className={labelClass}>Confirm new password</label>
          <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        <button type="submit" disabled={pending} className={`w-full ${primaryButtonClass}`}>
          {pending ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </AuthCard>
  );
}
