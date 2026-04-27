-- =====================================================================
-- Pani — policies.sql
-- Run after schema.sql. Enables RLS and adds row-level access rules.
-- =====================================================================

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists users_select_all on public.users;
create policy users_select_all on public.users
  for select using (true);

drop policy if exists users_insert_own on public.users;
create policy users_insert_own on public.users
  for insert with check (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- categories  (public read; admin-managed inserts only)
-- ---------------------------------------------------------------------
alter table public.categories enable row level security;

drop policy if exists categories_select_all on public.categories;
create policy categories_select_all on public.categories
  for select using (true);

-- ---------------------------------------------------------------------
-- worker_profiles
-- ---------------------------------------------------------------------
alter table public.worker_profiles enable row level security;

drop policy if exists worker_profiles_select_all on public.worker_profiles;
create policy worker_profiles_select_all on public.worker_profiles
  for select using (true);

drop policy if exists worker_profiles_modify_own on public.worker_profiles;
create policy worker_profiles_modify_own on public.worker_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- job_requests  (public read; client owns)
-- ---------------------------------------------------------------------
alter table public.job_requests enable row level security;

drop policy if exists job_requests_select_all on public.job_requests;
create policy job_requests_select_all on public.job_requests
  for select using (true);

drop policy if exists job_requests_insert_own on public.job_requests;
create policy job_requests_insert_own on public.job_requests
  for insert with check (auth.uid() = client_id);

drop policy if exists job_requests_modify_own on public.job_requests;
create policy job_requests_modify_own on public.job_requests
  for update using (auth.uid() = client_id) with check (auth.uid() = client_id);

drop policy if exists job_requests_delete_own on public.job_requests;
create policy job_requests_delete_own on public.job_requests
  for delete using (auth.uid() = client_id);

-- ---------------------------------------------------------------------
-- applications  (worker can apply; client + worker can view; client can update status)
-- ---------------------------------------------------------------------
alter table public.applications enable row level security;

drop policy if exists applications_select_participants on public.applications;
create policy applications_select_participants on public.applications
  for select using (
    auth.uid() = worker_id
    or auth.uid() = (select client_id from public.job_requests where id = job_id)
  );

drop policy if exists applications_insert_worker on public.applications;
create policy applications_insert_worker on public.applications
  for insert with check (auth.uid() = worker_id);

drop policy if exists applications_update_client on public.applications;
create policy applications_update_client on public.applications
  for update using (
    auth.uid() = (select client_id from public.job_requests where id = job_id)
    or auth.uid() = worker_id
  );

-- ---------------------------------------------------------------------
-- bookings  (visible to both parties; client creates)
-- ---------------------------------------------------------------------
alter table public.bookings enable row level security;

drop policy if exists bookings_select_participants on public.bookings;
create policy bookings_select_participants on public.bookings
  for select using (auth.uid() = client_id or auth.uid() = worker_id);

drop policy if exists bookings_insert_client on public.bookings;
create policy bookings_insert_client on public.bookings
  for insert with check (auth.uid() = client_id);

drop policy if exists bookings_update_participants on public.bookings;
create policy bookings_update_participants on public.bookings
  for update using (auth.uid() = client_id or auth.uid() = worker_id);

-- ---------------------------------------------------------------------
-- conversations + messages  (participant-scoped)
-- ---------------------------------------------------------------------
alter table public.conversations enable row level security;

drop policy if exists conversations_select_participants on public.conversations;
create policy conversations_select_participants on public.conversations
  for select using (auth.uid() = any(participant_ids));

drop policy if exists conversations_insert_participants on public.conversations;
create policy conversations_insert_participants on public.conversations
  for insert with check (auth.uid() = any(participant_ids));

drop policy if exists conversations_update_participants on public.conversations;
create policy conversations_update_participants on public.conversations
  for update using (auth.uid() = any(participant_ids));

alter table public.messages enable row level security;

drop policy if exists messages_select_participants on public.messages;
create policy messages_select_participants on public.messages
  for select using (
    auth.uid() in (
      select unnest(participant_ids) from public.conversations where id = conversation_id
    )
  );

drop policy if exists messages_insert_sender on public.messages;
create policy messages_insert_sender on public.messages
  for insert with check (
    auth.uid() = sender_id
    and auth.uid() in (
      select unnest(participant_ids) from public.conversations where id = conversation_id
    )
  );

-- ---------------------------------------------------------------------
-- reviews  (anyone can read; only reviewer who is a booking participant can write)
-- ---------------------------------------------------------------------
alter table public.reviews enable row level security;

drop policy if exists reviews_select_all on public.reviews;
create policy reviews_select_all on public.reviews
  for select using (true);

drop policy if exists reviews_insert_reviewer on public.reviews;
create policy reviews_insert_reviewer on public.reviews
  for insert with check (auth.uid() = reviewer_id);

-- ---------------------------------------------------------------------
-- saved_workers  (private)
-- ---------------------------------------------------------------------
alter table public.saved_workers enable row level security;

drop policy if exists saved_workers_own on public.saved_workers;
create policy saved_workers_own on public.saved_workers
  for all using (auth.uid() = client_id) with check (auth.uid() = client_id);

-- ---------------------------------------------------------------------
-- Storage buckets: avatars + portfolios
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolios', 'portfolios', true)
on conflict (id) do nothing;

drop policy if exists "avatars-read" on storage.objects;
create policy "avatars-read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars-write-own" on storage.objects;
create policy "avatars-write-own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars-update-own" on storage.objects;
create policy "avatars-update-own" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "portfolios-read" on storage.objects;
create policy "portfolios-read" on storage.objects
  for select using (bucket_id = 'portfolios');

drop policy if exists "portfolios-write-own" on storage.objects;
create policy "portfolios-write-own" on storage.objects
  for insert with check (
    bucket_id = 'portfolios' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------
-- messages UPDATE  (needed for markRead to work under RLS)
-- ---------------------------------------------------------------------
drop policy if exists messages_update_participants on public.messages;
create policy messages_update_participants on public.messages
  for update using (
    auth.uid() in (
      select unnest(participant_ids) from public.conversations where id = conversation_id
    )
  );
