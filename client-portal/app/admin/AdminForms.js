'use client';

import { useState } from 'react';
import {
  addObjective,
  addService,
  createAdminInvite,
  createClientWithInvite,
  logEvent,
  regenerateClientInvite,
} from './actions';
import { useSubmit } from '../../components/useSubmit';
import { inputClass, labelClass, primaryButtonClass } from '../../components/ui';

// Shown exactly once — only the hash is stored, so if this is lost the
// fix is "New invite code", not looking it up.
function InviteCodeReveal({ code, label }) {
  const [copied, setCopied] = useState(false);
  const message = `Your NoirFlow client portal is ready.\n\n1. Go to ${typeof window !== 'undefined' ? window.location.origin : ''}/signup\n2. Enter this invite code: ${code}\n3. Choose your email and password.\n\nThe code works once and expires in 14 days.`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4">
      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Invite code for {label}</p>
      <p className="font-mono text-lg font-bold tracking-wider text-emerald-900 dark:text-emerald-200 mt-1 select-all">{code}</p>
      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">Shown once. Single use, expires in 14 days.</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <button type="button" onClick={copy} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
          {copied ? 'Copied ✓' : 'Copy message for client'}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300"
        >
          Send on WhatsApp
        </a>
      </div>
    </div>
  );
}

function FormFeedback({ error, done, result }) {
  if (error) return <p className="text-xs text-red-600 dark:text-red-400">{error}</p>;
  if (done && result?.message) return <p className="text-xs text-emerald-600 dark:text-emerald-400">{result.message}</p>;
  return null;
}

function ClientSelect({ clients, name = 'client_id', onChange }) {
  return (
    <select name={name} required defaultValue="" onChange={onChange} className={inputClass}>
      <option value="" disabled>
        Choose a client…
      </option>
      {clients.map((c) => (
        <option key={c.id} value={c.id}>
          {c.business_name}
        </option>
      ))}
    </select>
  );
}

export function CreateClientForm() {
  const { onSubmit, pending, error, done, result } = useSubmit(createClientWithInvite, { resetOnSuccess: true });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Business name *</label>
          <input name="business_name" required maxLength={200} className={inputClass} placeholder="Smile Dental Care" />
        </div>
        <div>
          <label className={labelClass}>Client slug</label>
          <input name="client_slug" maxLength={64} className={inputClass} placeholder="auto from name, e.g. smile-dental" />
        </div>
        <div>
          <label className={labelClass}>Contact name</label>
          <input name="contact_name" maxLength={200} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Contact phone</label>
          <input name="contact_phone" maxLength={20} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Contact email</label>
          <input name="contact_email" type="email" maxLength={254} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Plan</label>
          <input name="plan" maxLength={200} className={inputClass} placeholder="Care Plan — ₹3,999/mo" />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" defaultValue="onboarding" className={inputClass}>
            <option value="onboarding">Onboarding</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-neutral-300 sm:mt-6">
          <input type="checkbox" name="lock_email" className="rounded" />
          Only allow signup with the contact email above
        </label>
      </div>
      <FormFeedback error={error} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Creating…' : 'Create client + invite code'}
      </button>
      {done && result?.code && <InviteCodeReveal code={result.code} label={result.label} />}
    </form>
  );
}

export function RegenerateInviteButton({ clientId }) {
  const [state, setState] = useState({ pending: false, error: '', result: null });

  async function onClick() {
    if (!window.confirm('Issue a new invite code? Any unused code for this client stops working.')) return;
    setState({ pending: true, error: '', result: null });
    const outcome = await regenerateClientInvite(clientId);
    setState({ pending: false, error: outcome.ok ? '' : outcome.error, result: outcome.ok ? outcome : null });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={state.pending}
        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-60"
      >
        {state.pending ? 'Generating…' : 'New invite code'}
      </button>
      {state.error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{state.error}</p>}
      {state.result && <InviteCodeReveal code={state.result.code} label={state.result.label} />}
    </div>
  );
}

export function AdminInviteForm() {
  const { onSubmit, pending, error, done, result } = useSubmit(createAdminInvite, { resetOnSuccess: true });
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className={labelClass}>Team member’s email</label>
        <input name="email" type="email" required className={inputClass} />
      </div>
      <FormFeedback error={error} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Creating…' : 'Create admin invite'}
      </button>
      {done && result?.code && <InviteCodeReveal code={result.code} label={result.label} />}
    </form>
  );
}

export function AddServiceForm({ clients }) {
  const { onSubmit, pending, error, done, result } = useSubmit(addService, { resetOnSuccess: true });
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <ClientSelect clients={clients} />
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="name" required maxLength={200} placeholder="Service name, e.g. WhatsApp AI Receptionist" className={inputClass} />
        <input name="service_type" maxLength={100} placeholder="Type, e.g. AI agent / Website" className={inputClass} />
        <select name="status" defaultValue="setup" className={inputClass}>
          <option value="setup">Setting up</option>
          <option value="active">Active</option>
          <option value="issue">Issue</option>
          <option value="paused">Paused</option>
        </select>
        <input name="started_at" type="date" className={inputClass} />
        <input name="dashboard_url" type="url" maxLength={500} placeholder="Live dashboard URL (optional)" className={inputClass} />
        <input name="slug" maxLength={64} placeholder="Automation slug (optional, auto)" className={inputClass} />
      </div>
      <textarea name="description" rows={2} maxLength={2000} placeholder="What it does for the client" className={`${inputClass} resize-none`} />
      <FormFeedback error={error} done={done} result={result} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Adding…' : 'Add service'}
      </button>
    </form>
  );
}

export function AddObjectiveForm({ clients }) {
  const { onSubmit, pending, error, done, result } = useSubmit(addObjective, { resetOnSuccess: true });
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <ClientSelect clients={clients} />
      <input name="title" required maxLength={200} placeholder="e.g. 40 appointments booked by AI per month" className={inputClass} />
      <div className="grid grid-cols-3 gap-3">
        <input name="current_value" type="number" min="0" step="any" placeholder="Current" className={inputClass} />
        <input name="target_value" type="number" min="0" step="any" placeholder="Target" className={inputClass} />
        <input name="unit" maxLength={50} placeholder="Unit" className={inputClass} />
      </div>
      <input name="due_date" type="date" className={inputClass} />
      <textarea name="description" rows={2} maxLength={2000} placeholder="Why this matters (optional)" className={`${inputClass} resize-none`} />
      <FormFeedback error={error} done={done} result={result} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Adding…' : 'Add objective'}
      </button>
    </form>
  );
}

export function LogEventForm({ clients, services }) {
  const [clientId, setClientId] = useState('');
  const [kind, setKind] = useState('update');
  // Not reset on success: when logging several updates for one client in a
  // row, keeping the client/service selected saves re-picking every time.
  const { onSubmit, pending, error, done, result } = useSubmit(logEvent);
  const clientServices = services.filter((s) => s.client_id === clientId);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <ClientSelect clients={clients} onChange={(e) => setClientId(e.target.value)} />
      <div className="grid sm:grid-cols-3 gap-3">
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
          <option value="update">Update from NoirFlow</option>
          <option value="operation">Operation</option>
          <option value="error">Error</option>
        </select>
        <select name="service_id" defaultValue="" className={inputClass}>
          <option value="">No specific service</option>
          {clientServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {kind === 'error' && (
          <select name="severity" defaultValue="warning" className={inputClass}>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        )}
      </div>
      <input name="title" required maxLength={200} placeholder="e.g. Updated Riya with new clinic hours" className={inputClass} />
      <textarea name="detail" rows={2} maxLength={4000} placeholder="Details the client should know (optional)" className={`${inputClass} resize-none`} />
      <FormFeedback error={error} done={done} result={result} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Logging…' : 'Log to client’s activity'}
      </button>
    </form>
  );
}
