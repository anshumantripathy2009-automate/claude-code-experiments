'use client';

import { redeemInvite } from '../auth/actions';
import { useSubmit } from '../../components/useSubmit';
import { inputClass, labelClass, primaryButtonClass } from '../../components/ui';

export default function SignupForm() {
  const { onSubmit, pending, error } = useSubmit(redeemInvite);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="code" className={labelClass}>Invite code</label>
        <input
          id="code"
          name="code"
          required
          autoComplete="off"
          placeholder="NF-XXXX-XXXX-XXXX"
          className={`${inputClass} font-mono uppercase tracking-wider`}
        />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>Your email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>Choose a password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
        <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="confirm_password" className={labelClass}>Confirm password</label>
        <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <button type="submit" disabled={pending} className={`w-full ${primaryButtonClass}`}>
        {pending ? 'Creating your account…' : 'Create account'}
      </button>
    </form>
  );
}
