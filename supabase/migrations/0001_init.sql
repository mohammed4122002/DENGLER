-- ===========================================================================
-- Crete Roots Company — initial schema
--
-- Apply with:  supabase db push
--        or:   psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
--
-- Design notes
--   * Public visitors may read PUBLISHED properties and their relations only.
--   * Public visitors may INSERT an inquiry but never read one back.
--   * Everything else requires an admin, identified by public.is_admin().
-- ===========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- --------------------------------------------------------------------------
-- Enums
-- --------------------------------------------------------------------------
do $$ begin
  create type property_type as enum ('villa', 'hotel', 'land');
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_status as enum ('available', 'reserved', 'sold', 'off_market');
exception when duplicate_object then null; end $$;

do $$ begin
  create type investment_type as enum (
    'buy_to_hold', 'rental_yield', 'hospitality_operation',
    'development', 'capital_appreciation'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_status as enum ('new', 'contacted', 'closed');
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------------------
-- profiles — mirrors auth.users, carries the admin flag
-- --------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at  timestamptz not null default now()
);

-- Row-level checks call this instead of reading profiles directly, which would
-- recurse through the profiles policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Every new auth user gets a profile automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------------------------
-- properties
-- --------------------------------------------------------------------------
create table if not exists public.properties (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  tagline         text not null default '',
  description     text not null default '',

  property_type   property_type not null,
  status          property_status not null default 'available',

  price           numeric(14, 2) not null check (price >= 0),
  currency        text not null default 'USD' check (char_length(currency) = 3),

  location        text not null,
  country         text not null,
  city            text not null,
  latitude        double precision,
  longitude       double precision,

  area            numeric(12, 2) not null check (area >= 0),
  bedrooms        integer check (bedrooms >= 0),
  bathrooms       integer check (bathrooms >= 0),
  year_built      integer check (year_built between 1500 and 2200),

  investment_type investment_type not null default 'buy_to_hold',
  roi             numeric(5, 2) check (roi >= 0),
  annual_revenue  numeric(14, 2) check (annual_revenue >= 0),
  occupancy_rate  numeric(5, 2) check (occupancy_rate between 0 and 100),
  appreciation    numeric(5, 2) check (appreciation >= 0),

  featured        boolean not null default false,
  published       boolean not null default false,

  cover_image     text not null default '',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Backs the free-text search with a plain ILIKE, so no extension is needed.
  search_text     text generated always as (
    lower(
      coalesce(title, '') || ' ' || coalesce(tagline, '') || ' ' ||
      coalesce(location, '') || ' ' || coalesce(city, '') || ' ' ||
      coalesce(country, '') || ' ' || coalesce(description, '')
    )
  ) stored
);

create index if not exists properties_published_idx   on public.properties (published);
create index if not exists properties_type_idx        on public.properties (property_type);
create index if not exists properties_featured_idx    on public.properties (featured) where featured;
create index if not exists properties_price_idx       on public.properties (price);
create index if not exists properties_roi_idx         on public.properties (roi);
create index if not exists properties_country_idx     on public.properties (country);
create index if not exists properties_created_idx     on public.properties (created_at desc);
create index if not exists properties_search_idx      on public.properties using gin (search_text gin_trgm_ops);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_touch_updated_at on public.properties;
create trigger properties_touch_updated_at
  before update on public.properties
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------------
-- property_images
-- --------------------------------------------------------------------------
create table if not exists public.property_images (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  image_url   text not null,
  alt         text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists property_images_property_idx
  on public.property_images (property_id, sort_order);

-- --------------------------------------------------------------------------
-- property_features
-- --------------------------------------------------------------------------
create table if not exists public.property_features (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  feature     text not null,
  unique (property_id, feature)
);

create index if not exists property_features_property_idx
  on public.property_features (property_id);

-- --------------------------------------------------------------------------
-- inquiries
-- --------------------------------------------------------------------------
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone       text check (char_length(phone) <= 40),
  message     text not null check (char_length(message) between 1 and 4000),
  status      inquiry_status not null default 'new',
  created_at  timestamptz not null default now()
);

create index if not exists inquiries_status_idx  on public.inquiries (status);
create index if not exists inquiries_created_idx on public.inquiries (created_at desc);

-- --------------------------------------------------------------------------
-- site_stats — the headline figures on the home page
-- --------------------------------------------------------------------------
create table if not exists public.site_stats (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  value       text not null,
  sort_order  integer not null default 0
);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles          enable row level security;
alter table public.properties        enable row level security;
alter table public.property_images   enable row level security;
alter table public.property_features enable row level security;
alter table public.inquiries         enable row level security;
alter table public.site_stats        enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: admin writes" on public.profiles;
create policy "profiles: admin writes" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- properties ----------------------------------------------------------------
drop policy if exists "properties: public reads published" on public.properties;
create policy "properties: public reads published" on public.properties
  for select using (published or public.is_admin());

drop policy if exists "properties: admin writes" on public.properties;
create policy "properties: admin writes" on public.properties
  for all using (public.is_admin()) with check (public.is_admin());

-- property_images -----------------------------------------------------------
drop policy if exists "images: public reads published" on public.property_images;
create policy "images: public reads published" on public.property_images
  for select using (
    public.is_admin() or exists (
      select 1 from public.properties p
      where p.id = property_id and p.published
    )
  );

drop policy if exists "images: admin writes" on public.property_images;
create policy "images: admin writes" on public.property_images
  for all using (public.is_admin()) with check (public.is_admin());

-- property_features ---------------------------------------------------------
drop policy if exists "features: public reads published" on public.property_features;
create policy "features: public reads published" on public.property_features
  for select using (
    public.is_admin() or exists (
      select 1 from public.properties p
      where p.id = property_id and p.published
    )
  );

drop policy if exists "features: admin writes" on public.property_features;
create policy "features: admin writes" on public.property_features
  for all using (public.is_admin()) with check (public.is_admin());

-- inquiries -----------------------------------------------------------------
-- Anyone may submit. Nobody but an admin may read, update or delete.
drop policy if exists "inquiries: public submits" on public.inquiries;
create policy "inquiries: public submits" on public.inquiries
  for insert with check (status = 'new');

drop policy if exists "inquiries: admin reads" on public.inquiries;
create policy "inquiries: admin reads" on public.inquiries
  for select using (public.is_admin());

drop policy if exists "inquiries: admin writes" on public.inquiries;
create policy "inquiries: admin writes" on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inquiries: admin deletes" on public.inquiries;
create policy "inquiries: admin deletes" on public.inquiries
  for delete using (public.is_admin());

-- site_stats ----------------------------------------------------------------
drop policy if exists "stats: public reads" on public.site_stats;
create policy "stats: public reads" on public.site_stats
  for select using (true);

drop policy if exists "stats: admin writes" on public.site_stats;
create policy "stats: admin writes" on public.site_stats
  for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- Storage bucket for admin-uploaded property photography
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists "property images are public" on storage.objects;
create policy "property images are public" on storage.objects
  for select using (bucket_id = 'property-images');

drop policy if exists "admins upload property images" on storage.objects;
create policy "admins upload property images" on storage.objects
  for insert with check (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "admins delete property images" on storage.objects;
create policy "admins delete property images" on storage.objects
  for delete using (bucket_id = 'property-images' and public.is_admin());
