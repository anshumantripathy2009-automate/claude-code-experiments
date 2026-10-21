// Invite codes ("pass keys") — what a client redeems at /signup to create
// their account. Only the SHA-256 hash is ever stored in the database; the
// plaintext code is shown to NoirFlow once, at creation time, to hand over.

import { createHash, randomBytes } from 'node:crypto';

// No 0/O/1/I/L — codes get read out over the phone and typed on mobile.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const GROUPS = 3;
const GROUP_LENGTH = 4;
export const INVITE_TTL_DAYS = 14;

// 12 characters from a 31-symbol alphabet ≈ 59 bits — far beyond what anyone
// could guess, even before the per-IP rate limit on /signup.
export function generateInviteCode() {
  const bytes = randomBytes(GROUPS * GROUP_LENGTH);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  const groups = [];
  for (let i = 0; i < GROUPS; i++) {
    groups.push(chars.slice(i * GROUP_LENGTH, (i + 1) * GROUP_LENGTH).join(''));
  }
  return `NF-${groups.join('-')}`;
}

// Accepts the code however the client typed it — lowercase, spaces, missing
// dashes — so a correct code is never rejected over formatting.
export function normalizeInviteCode(raw) {
  const cleaned = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const body = cleaned.startsWith('NF') ? cleaned.slice(2) : cleaned;
  if (body.length !== GROUPS * GROUP_LENGTH) return null;
  const groups = [];
  for (let i = 0; i < GROUPS; i++) {
    groups.push(body.slice(i * GROUP_LENGTH, (i + 1) * GROUP_LENGTH));
  }
  return `NF-${groups.join('-')}`;
}

export function hashInviteCode(code) {
  return createHash('sha256').update(code).digest('hex');
}

export function inviteExpiry() {
  return new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}
