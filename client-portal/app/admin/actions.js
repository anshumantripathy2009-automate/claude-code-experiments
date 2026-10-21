'use server';

// Admin console actions. Every one starts with requireAdmin(): a server
// action is a public POST endpoint, so the check must live here, not just in
// the page that renders the button. After that check they use the service
// role, since admins legitimately manage every client's data.

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '../../lib/supabase/server';
import { requireAdmin } from '../../lib/portal';
import { generateInviteCode, hashInviteCode, inviteExpiry } from '../../lib/invite';

const SLUG_PATTERN = /^[a-z0-9-]{1,64}$/;

function text(formData, key, max) {
  const value = String(formData.get(key) || '').trim();
  return value ? value.slice(0, max) : null;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function fail(context, error, message = 'That didn’t save. Check the fields and try again.') {
  console.error(`[admin] ${context}:`, error);
  return { ok: false, error: message };
}

async function issueInvite(service, { role, clientId = null, email = null }) {
  const code = generateInviteCode();
  const { error } = await service.from('invites').insert({
    code_hash: hashInviteCode(code),
    role,
    client_id: clientId,
    email,
    expires_at: inviteExpiry(),
  });
  if (error) throw error;
  return code;
}

export async function createClientWithInvite(formData) {
  await requireAdmin();

  const businessName = text(formData, 'business_name', 200);
  if (!businessName) return { ok: false, error: 'Business name is required.' };

  const clientSlug = slugify(text(formData, 'client_slug', 64) || businessName);
  if (!SLUG_PATTERN.test(clientSlug)) return { ok: false, error: 'Client slug can only use lowercase letters, numbers and dashes.' };

  const email = text(formData, 'contact_email', 254)?.toLowerCase() || null;
  const lockEmail = formData.get('lock_email') === 'on';

  const service = createServiceClient();
  const { data: client, error } = await service
    .from('clients')
    .insert({
      business_name: businessName,
      contact_name: text(formData, 'contact_name', 200),
      contact_email: email,
      contact_phone: text(formData, 'contact_phone', 20),
      client_slug: clientSlug,
      plan: text(formData, 'plan', 200),
      status: ['onboarding', 'active', 'paused'].includes(formData.get('status')) ? formData.get('status') : 'onboarding',
    })
    .select('id, business_name')
    .single();

  if (error) {
    const duplicate = error.code === '23505';
    return fail('createClient', error, duplicate ? `A client with the slug "${clientSlug}" already exists.` : undefined);
  }

  try {
    const code = await issueInvite(service, { role: 'client', clientId: client.id, email: lockEmail ? email : null });
    revalidatePath('/admin');
    return { ok: true, code, label: client.business_name };
  } catch (inviteError) {
    return fail('issueInvite', inviteError, 'Client created, but the invite code failed. Use "New invite code" on the client.');
  }
}

// Voids any unused invites for this client and issues a fresh one — for a
// lost code, an expired code, or a code sent to the wrong person.
export async function regenerateClientInvite(clientId) {
  await requireAdmin();
  const service = createServiceClient();

  const { data: client } = await service.from('clients').select('id, business_name, auth_user_id').eq('id', clientId).maybeSingle();
  if (!client) return { ok: false, error: 'Client not found.' };
  if (client.auth_user_id) return { ok: false, error: 'This client already has an account. They can reset their password from the login page.' };

  await service.from('invites').delete().eq('client_id', clientId).is('used_at', null);

  try {
    const code = await issueInvite(service, { role: 'client', clientId });
    revalidatePath('/admin');
    return { ok: true, code, label: client.business_name };
  } catch (error) {
    return fail('regenerateClientInvite', error);
  }
}

export async function createAdminInvite(formData) {
  await requireAdmin();
  const email = text(formData, 'email', 254)?.toLowerCase();
  if (!email) return { ok: false, error: 'Enter the team member’s email — admin invites are always locked to one email.' };

  try {
    const code = await issueInvite(createServiceClient(), { role: 'admin', email });
    return { ok: true, code, label: `admin access for ${email}` };
  } catch (error) {
    return fail('createAdminInvite', error);
  }
}

export async function addService(formData) {
  await requireAdmin();

  const clientId = text(formData, 'client_id', 64);
  const name = text(formData, 'name', 200);
  if (!clientId || !name) return { ok: false, error: 'Pick a client and give the service a name.' };

  const service = createServiceClient();
  const { data: client } = await service.from('clients').select('client_slug').eq('id', clientId).maybeSingle();
  if (!client) return { ok: false, error: 'Client not found.' };

  const slug = slugify(text(formData, 'slug', 64) || `${client.client_slug}-${name}`);

  const { error } = await service.from('services').insert({
    client_id: clientId,
    slug,
    name,
    service_type: text(formData, 'service_type', 100),
    status: ['setup', 'active', 'issue', 'paused'].includes(formData.get('status')) ? formData.get('status') : 'setup',
    description: text(formData, 'description', 2000),
    dashboard_url: text(formData, 'dashboard_url', 500),
    started_at: text(formData, 'started_at', 10),
  });

  if (error) return fail('addService', error, error.code === '23505' ? `Service slug "${slug}" is already taken.` : undefined);
  revalidatePath('/admin');
  return { ok: true, message: `Added. Automation slug: ${slug}` };
}

export async function updateServiceStatus(serviceId, formData) {
  await requireAdmin();
  const status = formData.get('status');
  if (!['setup', 'active', 'issue', 'paused'].includes(status)) return;
  await createServiceClient().from('services').update({ status, updated_at: new Date().toISOString() }).eq('id', serviceId);
  revalidatePath('/admin');
}

export async function addObjective(formData) {
  await requireAdmin();

  const clientId = text(formData, 'client_id', 64);
  const title = text(formData, 'title', 200);
  if (!clientId || !title) return { ok: false, error: 'Pick a client and give the objective a title.' };

  const target = Number(formData.get('target_value'));
  const current = Number(formData.get('current_value'));

  const { error } = await createServiceClient()
    .from('objectives')
    .insert({
      client_id: clientId,
      title,
      description: text(formData, 'description', 2000),
      target_value: Number.isFinite(target) && target > 0 ? target : null,
      current_value: Number.isFinite(current) && current >= 0 ? current : 0,
      unit: text(formData, 'unit', 50),
      due_date: text(formData, 'due_date', 10),
    });

  if (error) return fail('addObjective', error);
  revalidatePath('/admin');
  return { ok: true, message: 'Objective added.' };
}

export async function updateObjective(objectiveId, formData) {
  await requireAdmin();
  const current = Number(formData.get('current_value'));
  const status = formData.get('status');
  const changes = { updated_at: new Date().toISOString() };
  if (Number.isFinite(current) && current >= 0) changes.current_value = current;
  if (['on_track', 'at_risk', 'achieved'].includes(status)) changes.status = status;
  await createServiceClient().from('objectives').update(changes).eq('id', objectiveId);
  revalidatePath('/admin');
}

export async function logEvent(formData) {
  await requireAdmin();

  const clientId = text(formData, 'client_id', 64);
  const title = text(formData, 'title', 200);
  if (!clientId || !title) return { ok: false, error: 'Pick a client and add a title.' };

  const kind = ['operation', 'error', 'update'].includes(formData.get('kind')) ? formData.get('kind') : 'update';
  const severity = ['info', 'warning', 'critical'].includes(formData.get('severity')) ? formData.get('severity') : 'info';

  const { error } = await createServiceClient()
    .from('service_events')
    .insert({
      client_id: clientId,
      service_id: text(formData, 'service_id', 64),
      kind,
      severity: kind === 'error' ? severity : 'info',
      title,
      detail: text(formData, 'detail', 4000),
    });

  if (error) return fail('logEvent', error);
  revalidatePath('/admin');
  return { ok: true, message: 'Logged — the client can see it in their Activity feed.' };
}

export async function resolveError(eventId) {
  await requireAdmin();
  await createServiceClient().from('service_events').update({ resolved_at: new Date().toISOString() }).eq('id', eventId).eq('kind', 'error');
  revalidatePath('/admin');
}

export async function updateTicketStatus(ticketId, formData) {
  await requireAdmin();
  const status = formData.get('status');
  if (!['open', 'in_progress', 'resolved'].includes(status)) return;
  await createServiceClient().from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId);
  revalidatePath('/admin');
}
