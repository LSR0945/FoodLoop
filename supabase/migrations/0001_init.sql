-- ============================================================================
-- FoodLoop — Supabase schema (migration 0001_init)
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Safe to re-run (idempotent: IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Profiles (one row per registered user; uid = Supabase auth user id)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  uid text primary key,
  name text not null default '',
  email text not null default '',
  role text not null default 'donor',
  "orgName" text,
  phone text,
  area text,
  shifts text[] default '{}',
  "donorType" text,
  "fssaiNumber" text,
  "defaultPickupAddress" text,
  bio text,
  "photoURL" text,
  "contactPerson" text,
  "registrationNumber" text,
  "operatingAddress" text,
  "dailyCapacity" bigint,
  "vehicleType" text,
  "emergencyContact" text,
  verified boolean not null default false,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- ---------------------------------------------------------------------------
-- 2. Listings (surplus food donations)
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id text primary key,
  "donorId" text not null,
  "donorName" text not null default '',
  "donorAvatar" text,
  "donorPhone" text,
  title text not null default '',
  description text,
  category text not null default 'Cooked meals',
  "foodType" text not null default 'veg',
  quantity numeric not null default 0,
  unit text not null default 'plates',
  "preparedAt" bigint,
  "pickupDeadline" bigint,
  "locationText" text not null default '',
  "pickupInstructions" text,
  storage text not null default 'room',
  allergens text[] default '{}',
  checklist jsonb,
  photo text,
  gallery text[] default '{}',
  status text not null default 'available',
  "reservedBy" text,
  "reservedByName" text,
  "pickupCode" text,
  "reservedQuantity" numeric,
  "volunteerId" text,
  "volunteerName" text,
  "quantityDistributed" numeric,
  "completionNote" text,
  "completedAt" bigint,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint,
  history jsonb not null default '[]'::jsonb
);

create index if not exists listings_created_at_idx on public.listings ("createdAt" desc);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_donor_idx on public.listings ("donorId");

-- ---------------------------------------------------------------------------
-- 3. Donors
-- ---------------------------------------------------------------------------
create table if not exists public.donors (
  uid text primary key,
  name text not null default '',
  "orgName" text,
  "donorType" text,
  email text not null default '',
  phone text,
  area text,
  "defaultPickupAddress" text,
  "fssaiNumber" text,
  bio text,
  "photoURL" text,
  verified boolean not null default false,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- ---------------------------------------------------------------------------
-- 4. Recipients / NGOs (recipients is canonical; ngos mirrors it)
-- ---------------------------------------------------------------------------
create table if not exists public.recipients (
  uid text primary key,
  name text not null default '',
  "orgName" text,
  "contactPerson" text,
  "registrationNumber" text,
  email text not null default '',
  phone text,
  area text,
  "operatingAddress" text,
  "dailyCapacity" bigint,
  "photoURL" text,
  verified boolean not null default false,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists public.ngos (
  uid text primary key,
  name text not null default '',
  "orgName" text,
  "contactPerson" text,
  "registrationNumber" text,
  email text not null default '',
  phone text,
  area text,
  "operatingAddress" text,
  "dailyCapacity" bigint,
  "photoURL" text,
  verified boolean not null default false,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- ---------------------------------------------------------------------------
-- 5. Volunteers
-- ---------------------------------------------------------------------------
create table if not exists public.volunteers (
  uid text primary key,
  name text not null default '',
  email text not null default '',
  phone text,
  area text,
  shifts text[] default '{}',
  "vehicleType" text,
  "emergencyContact" text,
  "photoURL" text,
  verified boolean not null default false,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- ---------------------------------------------------------------------------
-- 5b. Admins
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  uid text primary key,
  name text not null default '',
  email text not null default '',
  phone text,
  area text,
  "photoURL" text,
  verified boolean not null default false,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- ---------------------------------------------------------------------------
-- 6. Notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  "userId" text not null,
  title text not null default '',
  body text not null default '',
  "listingId" text,
  read boolean not null default false,
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists notifications_user_idx on public.notifications ("userId", "createdAt" desc);

-- ---------------------------------------------------------------------------
-- 7. Reports (abuse / food-safety reports)
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id text primary key,
  "listingId" text,
  reason text,
  details text,
  "reportedBy" text,
  status text not null default 'open',
  "createdAt" bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- ---------------------------------------------------------------------------
-- 8. Platform notices (admin banners)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_notices (
  id text primary key,
  title text not null default '',
  body text not null default '',
  "targetRole" text not null default 'all',
  active boolean not null default true,
  date text
);

-- ---------------------------------------------------------------------------
-- 9. Row Level Security — permissive demo policies.
--    WARNING: this allows any client holding the public key to read/write.
--    Tighten with auth.uid() checks before any production use.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.donors enable row level security;
alter table public.recipients enable row level security;
alter table public.ngos enable row level security;
alter table public.volunteers enable row level security;
alter table public.admins enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.platform_notices enable row level security;

do $$
declare t text;
begin
  foreach t in array array['profiles','listings','donors','recipients','ngos','volunteers','admins','notifications','reports','platform_notices']
  loop
    execute format('drop policy if exists "foodloop_demo_all" on public.%I', t);
    execute format('create policy "foodloop_demo_all" on public.%I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- Make sure the public (publishable) key can actually read/write these tables.
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 10. Realtime (listings, notifications, profiles live updates)
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.listings;
exception when duplicate_object then null; when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null; when undefined_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 11. Auto-create a profile row whenever a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (uid, name, email, role, "createdAt")
  values (
    new.id::text,
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    'donor',
    (extract(epoch from now()) * 1000)::bigint
  )
  on conflict (uid) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Done. The app also works offline via its built-in local fallback, but
-- running this migration unlocks live data, realtime sync and multi-device use.
-- ---------------------------------------------------------------------------
