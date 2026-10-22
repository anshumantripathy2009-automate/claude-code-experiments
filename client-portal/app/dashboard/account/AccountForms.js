'use client';

import { changePassword, updateProfile } from '../actions';
import { useSubmit } from '../../../components/useSubmit';
import { inputClass, labelClass, primaryButtonClass } from '../../../components/ui';

export function ProfileForm({ client }) {
  const { onSubmit, pending, error, done } = useSubmit(updateProfile);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="contact_name" className={labelClass}>Your name</label>
        <input id="contact_name" name="contact_name" defaultValue={client.contact_name || ''} maxLength={200} className={inputClass} />
      </div>
      <div>
        <label htmlFor="contact_phone" className={labelClass}>Phone / WhatsApp</label>
        <input id="contact_phone" name="contact_phone" type="tel" defaultValue={client.contact_phone || ''} maxLength={20} className={inputClass} />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {done && <p className="text-xs text-emerald-600 dark:text-emerald-400">Saved.</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Saving…' : 'Save details'}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const { onSubmit, pending, error, done } = useSubmit(changePassword, { resetOnSuccess: true });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="current_password" className={labelClass}>Current password</label>
        <input id="current_password" name="current_password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
      </div>
      <div>
        <label htmlFor="confirm_password" className={labelClass}>Confirm new password</label>
        <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {done && <p className="text-xs text-emerald-600 dark:text-emerald-400">Password changed.</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Updating…' : 'Change password'}
      </button>
    </form>
  );
}
