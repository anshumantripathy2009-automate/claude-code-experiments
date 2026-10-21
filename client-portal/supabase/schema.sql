-- NoirFlow Client Portal — full database schema.
-- Run once in a fresh Supabase project (SQL editor → paste → Run).
-- Already applied to the `noirflow-agents` project; this file exists so the
-- portal can be set up again for a new deployment.

-- ─── Clients: one row per paying business ─────────────────────────────────
create table clients (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  business_name text not null check (char_length(business_name) between 1 and 200),
  contact_name text check (contact_name is null or char_length(contact_name) <= 200),
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  contact_phone text check (contact_phone is null or char_length(contact_phone) <= 20),
  client_slug text not null check (char_length(client_slug) between 1 and 64),
  automation_type text check (automation_type is null or char_length(automation_type) <= 100),
  dashboard_url text check (dashboard_url is null or char_length(dashboard_url) <= 500),
  plan text check (plan is null or char_length(plan) <= 200),
  status text not null default 'onboarding' check (status in ('onboarding', 'active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index clients_auth_user_id_idx on clients(auth_user_id) where auth_user_id is not null;
create unique index clients_client_slug_idx on clients(client_slug);

-- ─── Tickets: issues and requests a client sends NoirFlow ─────────────────
create table tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null check (type in ('issue', 'request')),
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 1 and 4000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tickets_client_id_idx on tickets(client_id);

-- ─── Admins: NoirFlow staff (checked server-side with the service role) ───
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─── Invites: the single-use "pass key" redeemed at /signup ───────────────
-- Only the SHA-256 hash of the code is stored; the plaintext is shown once.
create table invites (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique check (char_length(code_hash) = 64),
  role text not null check (role in ('client', 'admin')),
  client_id uuid references clients(id) on delete cascade,
  email text check (email is null or char_length(email) <= 254),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (role = 'admin' or client_id is not null)
);

-- ─── Services: what NoirFlow runs for each client ─────────────────────────
create table services (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,64}$'),
  name text not null check (char_length(name) between 1 and 200),
  service_type text check (service_type is null or char_length(service_type) <= 100),
  status text not null default 'setup' check (status in ('setup', 'active', 'issue', 'paused')),
  description text check (description is null or char_length(description) <= 2000),
  dashboard_url text check (dashboard_url is null or char_length(dashboard_url) <= 500),
  started_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_client_id_idx on services(client_id);

-- ─── Service events: operations log + error log + NoirFlow updates ────────
-- Written by the automations themselves and by the admin console.
create table service_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  kind text not null check (kind in ('operation', 'error', 'update')),
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  title text not null check (char_length(title) between 1 and 200),
  detail text check (detail is null or char_length(detail) <= 4000),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index service_events_client_created_idx on service_events(client_id, created_at desc);

-- ─── Objectives: the business goals the client is paying to hit ───────────
create table objectives (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text check (description is null or char_length(description) <= 2000),
  target_value numeric check (target_value is null or target_value >= 0),
  current_value numeric not null default 0 check (current_value >= 0),
  unit text check (unit is null or char_length(unit) <= 50),
  status text not null default 'on_track' check (status in ('on_track', 'at_risk', 'achieved')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index objectives_client_id_idx on objectives(client_id);

-- ─── Row Level Security ───────────────────────────────────────────────────
alter table clients enable row level security;
alter table tickets enable row level security;
alter table admins enable row level security;
alter table invites enable row level security;
alter table services enable row level security;
alter table service_events enable row level security;
alter table objectives enable row level security;

-- A logged-in client sees only rows belonging to their own client account.
create policy "clients read own row" on clients
  for select using (auth.uid() = auth_user_id);
create policy "clients update own row" on clients
  for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);
create policy "clients read own tickets" on tickets
  for select using (client_id in (select id from clients where auth_user_id = auth.uid()));
create policy "clients create own tickets" on tickets
  for insert with check (client_id in (select id from clients where auth_user_id = auth.uid()));
create policy "clients read own services" on services
  for select using (client_id in (select id from clients where auth_user_id = auth.uid()));
create policy "clients read own events" on service_events
  for select using (client_id in (select id from clients where auth_user_id = auth.uid()));
create policy "clients read own objectives" on objectives
  for select using (client_id in (select id from clients where auth_user_id = auth.uid()));

-- Column-level limits on top of RLS: a client may edit only their contact
-- details (not plan/status/business name), and may create a ticket but
-- never set its status.
revoke update on clients from authenticated, anon;
grant update (contact_name, contact_phone, updated_at) on clients to authenticated;
revoke insert, update, delete on tickets from authenticated, anon;
grant insert (client_id, type, subject, message) on tickets to authenticated;

-- Tracking tables are written only by the service role (admin console and
-- automations). Invites and admins are never reachable with a public key.
revoke insert, update, delete on services, service_events, objectives from authenticated, anon;
revoke all on invites, admins from authenticated, anon;

-- ─── Admin access via RLS (no service-role key in the web app) ────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy "admins manage clients" on clients
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage tickets" on tickets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage services" on services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage events" on service_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage objectives" on objectives
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage invites" on invites
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Only admins have insert/update policies on these, so clients gain nothing.
grant insert on clients to authenticated;
grant update (status, updated_at) on tickets to authenticated;
grant insert, update on services to authenticated;
grant insert, update (resolved_at) on service_events to authenticated;
grant insert, update on objectives to authenticated;
grant select, insert, delete on invites to authenticated;

-- ─── Used only by the redeem-invite Edge Function (service role) ──────────
-- Finds a never-signed-in, unlinked account with this email so a valid
-- invite can take it over instead of failing with "already exists".
create or replace function public.portal_dormant_user_id(p_email text)
returns uuid language sql stable security definer set search_path = ''
as $$
  select u.id from auth.users u
  where lower(u.email) = lower(p_email)
    and u.last_sign_in_at is null
    and not exists (select 1 from public.clients c where c.auth_user_id = u.id)
    and not exists (select 1 from public.admins a where a.user_id = u.id)
  limit 1;
$$;
revoke all on function public.portal_dormant_user_id(text) from public, anon, authenticated;
grant execute on function public.portal_dormant_user_id(text) to service_role;
