-- =====================================================================
-- Pani — schema.sql
-- Run this first in the Supabase SQL editor on a fresh project.
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- users (extends auth.users 1:1 on id)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique,
  full_name     text,
  avatar_url    text,
  phone         text,
  location      text,
  bio           text,
  role          text check (role in ('client', 'worker', 'both')) default 'client',
  is_verified   boolean default false,
  lat           numeric,
  lng           numeric,
  created_at    timestamptz default now()
);

-- Trigger: copy auth.users metadata into public.users on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, phone, location, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'location', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text unique not null,
  icon_emoji    text,
  description   text,
  worker_count  integer default 0
);

-- ---------------------------------------------------------------------
-- worker_profiles
-- ---------------------------------------------------------------------
create table if not exists public.worker_profiles (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  category        text not null,
  skills          text[] default '{}',
  hourly_rate     numeric,
  daily_rate      numeric,
  experience_years integer default 0,
  availability    jsonb default '{}'::jsonb,
  portfolio_urls  text[] default '{}',
  rating_avg      numeric default 0,
  total_jobs_done integer default 0,
  is_available    boolean default true,
  created_at      timestamptz default now(),
  unique (user_id, category)
);

create index if not exists idx_worker_profiles_category on public.worker_profiles(category);
create index if not exists idx_worker_profiles_available on public.worker_profiles(is_available);
create index if not exists idx_worker_profiles_rating on public.worker_profiles(rating_avg desc);

-- ---------------------------------------------------------------------
-- job_requests
-- ---------------------------------------------------------------------
create table if not exists public.job_requests (
  id            uuid primary key default uuid_generate_v4(),
  client_id     uuid not null references public.users(id) on delete cascade,
  title         text not null,
  description   text,
  category      text not null,
  budget_min    numeric,
  budget_max    numeric,
  location      text,
  urgency       text check (urgency in ('normal', 'urgent')) default 'normal',
  status        text check (status in ('open', 'in_progress', 'completed', 'cancelled')) default 'open',
  lat           numeric,
  lng           numeric,
  created_at    timestamptz default now()
);

create index if not exists idx_job_requests_status on public.job_requests(status, created_at desc);
create index if not exists idx_job_requests_category on public.job_requests(category);

-- ---------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------
create table if not exists public.applications (
  id            uuid primary key default uuid_generate_v4(),
  job_id        uuid not null references public.job_requests(id) on delete cascade,
  worker_id     uuid not null references public.users(id) on delete cascade,
  message       text,
  proposed_rate numeric,
  status        text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at    timestamptz default now(),
  unique (job_id, worker_id)
);

create index if not exists idx_applications_job on public.applications(job_id);
create index if not exists idx_applications_worker on public.applications(worker_id);

-- ---------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid not null references public.users(id) on delete cascade,
  worker_id       uuid not null references public.users(id) on delete cascade,
  job_request_id  uuid references public.job_requests(id) on delete set null,
  scheduled_date  date,
  scheduled_time  time,
  status          text check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')) default 'upcoming',
  agreed_rate     numeric,
  notes           text,
  created_at      timestamptz default now()
);

-- ---------------------------------------------------------------------
-- conversations + messages
-- ---------------------------------------------------------------------
create table if not exists public.conversations (
  id                  uuid primary key default uuid_generate_v4(),
  participant_ids     uuid[] not null,
  last_message        text,
  last_message_at     timestamptz default now(),
  related_booking_id  uuid references public.bookings(id) on delete set null,
  created_at          timestamptz default now()
);

create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.users(id) on delete cascade,
  content         text not null,
  created_at      timestamptz default now(),
  read_at         timestamptz
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);

-- ---------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.users(id) on delete cascade,
  reviewee_id uuid not null references public.users(id) on delete cascade,
  rating      integer check (rating between 1 and 5) not null,
  comment     text,
  created_at  timestamptz default now()
);

-- ---------------------------------------------------------------------
-- saved_workers
-- ---------------------------------------------------------------------
create table if not exists public.saved_workers (
  id          uuid primary key default uuid_generate_v4(),
  client_id   uuid not null references public.users(id) on delete cascade,
  worker_id   uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (client_id, worker_id)
);

-- ---------------------------------------------------------------------
-- Triggers: keep categories.worker_count in sync
-- ---------------------------------------------------------------------
create or replace function public.bump_worker_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.categories
       set worker_count = worker_count + 1
     where name = new.category;
  elsif tg_op = 'DELETE' then
    update public.categories
       set worker_count = greatest(0, worker_count - 1)
     where name = old.category;
  elsif tg_op = 'UPDATE' and old.category <> new.category then
    update public.categories set worker_count = greatest(0, worker_count - 1) where name = old.category;
    update public.categories set worker_count = worker_count + 1 where name = new.category;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_worker_count on public.worker_profiles;
create trigger trg_worker_count
  after insert or update or delete on public.worker_profiles
  for each row execute function public.bump_worker_count();

-- ---------------------------------------------------------------------
-- Realtime: enable replication for messages and bookings
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.conversations;
