// Vercel serverless function — GET /api/dashboard-data
// Powers dashboard.html with the clinic's real bookings (Google Sheets) and
// real conversations (Supabase). Read-only — never writes anything.
//
// SECURITY POSTURE (matches the Tier 1 audit applied to /webhook):
//   - Shared-secret check (DASHBOARD_ACCESS_KEY), but FAILS CLOSED (503)
//     when unset — unlike /webhook's fail-open posture. A bot endpoint
//     failing open just means "anyone can drive the bot"; this endpoint
//     failing open would leak real patient names and phone numbers to
//     the public internet, which is worse than refusing to serve.
//   - Per-IP rate limit (see _lib/rateLimit.js) — a public dashboard URL
//     is an easy target for someone to hammer and inflate Sheets/Supabase
//     read quota.
//   - "client" query param is length-capped and restricted to slug-safe
//     characters before it ever reaches a Supabase query.
//   - Patient phone numbers are masked to the last 4 digits in every
//     response field — even an authorized viewer shouldn't see full
//     numbers on what is still just a link-level secret, not a login.
//
// Query params:
//   key    - required, must match DASHBOARD_ACCESS_KEY
//   client - optional, defaults to "smile-dental" (see src/ai.js CLIENT_SLUG)

const { listBookings } = require('../src/sheets');
const { listRecentConversations } = require('../src/conversation-store');
const { enforceRateLimit } = require('./_lib/rateLimit');

const LOG_PREFIX = '[dashboard-data]';
const DEFAULT_CLIENT_SLUG = 'smile-dental';
const CLIENT_SLUG_PATTERN = /^[a-z0-9-]{1,64}$/;

// Keeps the last 4 digits only — e.g. "+919876543210" -> "•••• 3210",
// "tg:123456789" -> "•••• 6789". Patient phone numbers shouldn't be fully
// visible on a dashboard link that might get forwarded.
function maskPhone(raw) {
  if (!raw) return 'Unknown';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 4) return '•••• ' + digits;
  return '•••• ' + digits.slice(-4);
}

function startOfTodayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysAgoUTC(days) {
  const d = startOfTodayUTC();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  if (enforceRateLimit(req, res, LOG_PREFIX)) return;

  const providedKey = req.query.key || req.headers['x-dashboard-key'];
  const expectedKey = process.env.DASHBOARD_ACCESS_KEY;

  if (!expectedKey) {
    console.warn(`${LOG_PREFIX} DASHBOARD_ACCESS_KEY is not set — refusing all requests (fail closed).`);
    return res.status(503).json({
      error: 'Dashboard is not configured yet. Set DASHBOARD_ACCESS_KEY in Vercel environment variables.',
    });
  }
  if (!providedKey || providedKey !== expectedKey) {
    console.warn(`${LOG_PREFIX} Rejected request with missing/invalid access key.`);
    return res.status(401).json({ error: 'Invalid or missing access key.' });
  }

  const rawClient = typeof req.query.client === 'string' ? req.query.client.trim() : '';
  if (rawClient && !CLIENT_SLUG_PATTERN.test(rawClient)) {
    console.warn(`${LOG_PREFIX} Rejected request: "client" is not a valid slug.`);
    return res.status(400).json({ error: 'Invalid request.' });
  }
  const clientSlug = rawClient || DEFAULT_CLIENT_SLUG;

  try {
    const [{ bookings, configured: sheetsConfigured }, { conversations, configured: supabaseConfigured }] =
      await Promise.all([listBookings(), listRecentConversations(clientSlug, 8)]);

    const todayStart = startOfTodayUTC();
    const weekStart = daysAgoUTC(7);

    const bookingsWithDates = bookings
      .map((b) => ({ ...b, _ts: b.timestamp ? new Date(b.timestamp) : null }))
      .sort((a, b) => (b._ts || 0) - (a._ts || 0));

    const bookingsToday = bookingsWithDates.filter((b) => b._ts && b._ts >= todayStart).length;
    const bookingsThisWeek = bookingsWithDates.filter((b) => b._ts && b._ts >= weekStart).length;
    const pendingCount = bookingsWithDates.filter((b) => b.status && b.status.toLowerCase() !== 'confirmed').length;

    const recentBookings = bookingsWithDates.slice(0, 10).map((b) => ({
      patientName: b.patientName || 'Unknown',
      phoneNumber: maskPhone(b.phoneNumber),
      service: b.service || '—',
      preferredDate: b.preferredDate || '—',
      preferredTime: b.preferredTime || '—',
      status: b.status || 'Confirmed',
      loggedAt: b.timestamp,
    }));

    const totalMessages = conversations.reduce((sum, c) => sum + ((c.messages || []).length), 0);

    const recentConversations = conversations.map((c) => {
      const messages = c.messages || [];
      const last = messages[messages.length - 1];
      return {
        phoneNumber: maskPhone(c.phone_number),
        messageCount: messages.length,
        lastMessage: last ? last.text : '',
        lastMessageFrom: last ? last.role : null,
        updatedAt: c.updated_at,
        transcript: messages.slice(-12),
      };
    });

    return res.status(200).json({
      clientSlug,
      configured: { sheets: sheetsConfigured, supabase: supabaseConfigured },
      kpis: {
        totalBookings: bookingsWithDates.length,
        bookingsToday,
        bookingsThisWeek,
        pendingCount,
        conversationsHandled: conversations.length,
        totalMessages,
      },
      bookings: recentBookings,
      conversations: recentConversations,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[dashboard-data] Unexpected error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
};
