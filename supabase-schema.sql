create extension if not exists pgcrypto;

create table if not exists public.shows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  prefix text not null,
  total_seats integer not null default 188,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows(id) on delete cascade,
  requester_name text not null,
  phone text not null,
  ticket_count integer not null check (ticket_count > 0 and ticket_count <= 12),
  participant_names text not null,
  notes text,
  confirmed boolean not null default false,
  paid boolean not null default false,
  checked_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.serials (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows(id) on delete cascade,
  code text not null unique,
  status text not null check (status in ('LIBERO','PRENOTATO','PAGATO')) default 'LIBERO',
  assigned_to text,
  booking_id uuid references public.bookings(id) on delete set null
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

alter table public.shows enable row level security;
alter table public.bookings enable row level security;
alter table public.serials enable row level security;
alter table public.admins enable row level security;

revoke all on public.shows from anon, authenticated;
revoke all on public.bookings from anon, authenticated;
revoke all on public.serials from anon, authenticated;
revoke all on public.admins from anon, authenticated;

drop policy if exists "public read shows" on public.shows;
create policy "public read shows"
on public.shows
for select
to anon, authenticated
using (true);

drop policy if exists "public insert bookings" on public.bookings;
create policy "public insert bookings"
on public.bookings
for insert
to anon, authenticated
with check (
  confirmed = false
  and paid = false
  and checked_in = false
);

drop policy if exists "admins select bookings" on public.bookings;
create policy "admins select bookings"
on public.bookings
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins update bookings" on public.bookings;
create policy "admins update bookings"
on public.bookings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins delete bookings" on public.bookings;
create policy "admins delete bookings"
on public.bookings
for delete
to authenticated
using (public.is_admin());

drop policy if exists "admins select serials" on public.serials;
create policy "admins select serials"
on public.serials
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins update serials" on public.serials;
create policy "admins update serials"
on public.serials
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins insert serials" on public.serials;
create policy "admins insert serials"
on public.serials
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "admins select admins" on public.admins;
create policy "admins select admins"
on public.admins
for select
to authenticated
using (public.is_admin());

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row
execute function public.handle_updated_at();

insert into public.shows (name, slug, prefix, total_seats)
values
  ('Lisistrata', 'lisistrata', 'S1', 188),
  ('Pillole di Teatro', 'pillole-di-teatro', 'S2', 188),
  ('Il Teatro Comico', 'il-teatro-comico', 'S3', 188),
  ('La Famiglia Addams', 'la-famiglia-addams', 'S4', 188),
  ('Orario di Visita', 'orario-di-visita', 'S5', 188),
  ('Padre Incerto Madre Pure', 'padre-incerto-madre-pure', 'S6', 188)
on conflict (slug) do nothing;

with show_data as (
  select id, prefix from public.shows
)
insert into public.serials (show_id, code, status)
select
  s.id,
  s.prefix || '-' || lpad(gs::text, 3, '0'),
  'LIBERO'
from show_data s
cross join generate_series(1, 188) as gs
on conflict (code) do nothing;
