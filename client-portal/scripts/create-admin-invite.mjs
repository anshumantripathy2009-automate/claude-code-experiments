// Bootstraps the FIRST admin on a fresh deployment (after that, invite team
// members from the admin console). Prints a one-time invite code and the SQL
// to store its hash — run that SQL in the Supabase SQL editor, then redeem
// the code at /signup with the same email.
//
// Usage: npm run invite:admin -- you@yourcompany.com

import { generateInviteCode, hashInviteCode, inviteExpiry } from '../lib/invite.js';

const email = String(process.argv[2] || '').trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run invite:admin -- you@yourcompany.com');
  process.exit(1);
}

const code = generateInviteCode();
const sql = `insert into invites (code_hash, role, email, expires_at)
values ('${hashInviteCode(code)}', 'admin', '${email.replace(/'/g, "''")}', '${inviteExpiry()}');`;

console.log(`\nInvite code (shown once): ${code}\n`);
console.log('Run this in the Supabase SQL editor:\n');
console.log(sql);
console.log(`\nThen open /signup, enter the code and sign up as ${email}.\n`);
