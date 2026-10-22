// Sends what the receptionist does (bookings, failures) to the NoirFlow
// client portal, so the clinic sees it under Activity without asking us.
//
// Writes to the portal's `service_events` table using the same Supabase
// project and service-role client as conversation memory. Which service the
// events belong to is set by PORTAL_SERVICE_SLUG — the "Automation slug"
// shown in the portal's admin console when the service was added.
//
// Rules: never throw, never block a patient's reply on this. If anything is
// missing or fails, log it and carry on.

const supabase = require('./supabase-client');

// One outage shouldn't post 200 identical errors to the client's feed —
// the same error title is logged at most once per window per instance.
const ERROR_REPEAT_WINDOW_MS = 10 * 60 * 1000;
const lastErrorAt = new Map();

let cachedService = null;

async function resolveService() {
  if (cachedService) return cachedService;

  const slug = process.env.PORTAL_SERVICE_SLUG;
  if (!slug || !supabase) return null;

  const { data, error } = await supabase
    .from('services')
    .select('id, client_id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[portal-events] Could not look up service:', error.message);
    return null;
  }
  if (!data) {
    console.warn(`[portal-events] No portal service with slug "${slug}" — events skipped.`);
    return null;
  }

  cachedService = data;
  return cachedService;
}

async function logEvent({ kind, title, detail = null, severity = 'info' }) {
  try {
    const service = await resolveService();
    if (!service) return;

    const { error } = await supabase.from('service_events').insert({
      client_id: service.client_id,
      service_id: service.id,
      kind,
      severity,
      title: String(title).slice(0, 200),
      detail: detail ? String(detail).slice(0, 4000) : null,
    });

    if (error) console.error('[portal-events] Insert failed:', error.message);
  } catch (err) {
    console.error('[portal-events] Unexpected error:', err.message);
  }
}

function logOperation(title, detail) {
  return logEvent({ kind: 'operation', title, detail });
}

function logError(title, detail, severity = 'warning') {
  const now = Date.now();
  if (now - (lastErrorAt.get(title) || 0) < ERROR_REPEAT_WINDOW_MS) return Promise.resolve();
  lastErrorAt.set(title, now);
  return logEvent({ kind: 'error', title, detail, severity });
}

module.exports = { logOperation, logError };
