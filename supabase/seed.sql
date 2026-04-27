-- =====================================================================
-- Pani — seed.sql
-- Run after schema.sql + policies.sql + add_location_coords.sql.
--
-- Inserts into auth.users first (so the FK is satisfied), then the
-- handle_new_user trigger auto-creates public.users rows, which we
-- UPDATE to add bio/avatar/is_verified.
-- Demo password for all accounts: Pani@2026!
-- =====================================================================

-- Need pgcrypto for password hashing
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Categories (20 total)
-- ---------------------------------------------------------------------
insert into public.categories (name, icon_emoji, description) values
  ('Cleaning',    '🧹', 'House cleaning, deep cleans, post-event cleaning'),
  ('Driving',     '🚗', 'Personal drivers, school runs, airport drops'),
  ('Grocery',     '🛒', 'Grocery shopping, market runs, deliveries'),
  ('Plumbing',    '🔧', 'Leaks, fittings, water tank work'),
  ('Electrical',  '⚡', 'Wiring, repairs, fan & light installation'),
  ('Carpentry',   '🪚', 'Custom furniture, repairs, fittings'),
  ('Painting',    '🖌️', 'Interior, exterior, touch-ups'),
  ('Tutoring',    '📚', 'Home tuition, all subjects, all classes'),
  ('Cooking',     '👨‍🍳', 'Daily cooks, party catering, special diets'),
  ('Childcare',   '👶', 'Babysitting, after-school care'),
  ('Elder Care',  '🧓', 'Companionship, daily assistance'),
  ('Pet Care',    '🐾', 'Walking, sitting, grooming'),
  ('Gardening',   '🌿', 'Lawn care, pruning, planting'),
  ('Security',    '🛡️', 'Watchmen, event security'),
  ('Tailoring',   '✂️', 'Stitching, alterations, blouses'),
  ('IT Help',     '💻', 'PC fixes, wifi setup, software help'),
  ('Moving',      '📦', 'Packing, loading, shifting houses'),
  ('Laundry',     '👕', 'Wash, iron, dry-clean pickup'),
  ('Events',      '🎉', 'Decorators, hosts, helpers'),
  ('Fitness',     '💪', 'Personal trainers, yoga at home')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- Step 1: Insert into auth.users (satisfies the FK constraint)
-- The handle_new_user trigger will auto-create public.users rows.
-- ---------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data
)
values
  ('00000000-0000-0000-0000-000000000000',
   '11111111-1111-1111-1111-111111111101', 'authenticated', 'authenticated',
   'reshma@pani.demo', crypt('Pani@2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"full_name":"Reshma P","phone":"+91 90000 00001","location":"Kakkanad, Kochi","role":"worker"}'::jsonb,
   '{"provider":"email","providers":["email"]}'::jsonb),

  ('00000000-0000-0000-0000-000000000000',
   '11111111-1111-1111-1111-111111111102', 'authenticated', 'authenticated',
   'anoop@pani.demo', crypt('Pani@2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"full_name":"Anoop K M","phone":"+91 90000 00002","location":"Aluva, Kochi","role":"worker"}'::jsonb,
   '{"provider":"email","providers":["email"]}'::jsonb),

  ('00000000-0000-0000-0000-000000000000',
   '11111111-1111-1111-1111-111111111103', 'authenticated', 'authenticated',
   'fathima@pani.demo', crypt('Pani@2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"full_name":"Fathima Beevi","phone":"+91 90000 00003","location":"Kozhikode","role":"worker"}'::jsonb,
   '{"provider":"email","providers":["email"]}'::jsonb),

  ('00000000-0000-0000-0000-000000000000',
   '11111111-1111-1111-1111-111111111104', 'authenticated', 'authenticated',
   'vishnu@pani.demo', crypt('Pani@2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"full_name":"Vishnu Das","phone":"+91 90000 00004","location":"Trivandrum","role":"worker"}'::jsonb,
   '{"provider":"email","providers":["email"]}'::jsonb),

  ('00000000-0000-0000-0000-000000000000',
   '11111111-1111-1111-1111-111111111105', 'authenticated', 'authenticated',
   'priya@pani.demo', crypt('Pani@2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"full_name":"Priya Menon","phone":"+91 90000 00005","location":"Thrissur","role":"worker"}'::jsonb,
   '{"provider":"email","providers":["email"]}'::jsonb),

  ('00000000-0000-0000-0000-000000000000',
   '11111111-1111-1111-1111-111111111106', 'authenticated', 'authenticated',
   'suresh@pani.demo', crypt('Pani@2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"full_name":"Suresh Kumar","phone":"+91 90000 00006","location":"Kochi","role":"worker"}'::jsonb,
   '{"provider":"email","providers":["email"]}'::jsonb),

  ('00000000-0000-0000-0000-000000000000',
   '22222222-2222-2222-2222-222222222201', 'authenticated', 'authenticated',
   'demo.client@pani.demo', crypt('Pani@2026!', gen_salt('bf')),
   now(), now(), now(),
   '{"full_name":"Arjun Nair","phone":"+91 91111 00001","location":"Kochi","role":"client"}'::jsonb,
   '{"provider":"email","providers":["email"]}'::jsonb)

on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Step 2: UPDATE public.users to add avatar, bio, is_verified
-- (trigger already created the rows from the metadata above)
-- ---------------------------------------------------------------------
update public.users set
  avatar_url = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&face',
  bio = 'Cleaning chechi who actually shows up. 8 years across Kochi homes & flats.',
  is_verified = true
where id = '11111111-1111-1111-1111-111111111101';

update public.users set
  avatar_url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
  bio = 'Plumber. If it leaks, I fix. 12 years in Ernakulam district. Same-day pani.',
  is_verified = true
where id = '11111111-1111-1111-1111-111111111102';

update public.users set
  avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
  bio = 'Math + Physics tutor for classes 8–12. Have lost zero kids to board exams.',
  is_verified = true
where id = '11111111-1111-1111-1111-111111111103';

update public.users set
  avatar_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
  bio = 'Driver. Long trips, school runs, airport drops. Big Bose car, bigger smile.',
  is_verified = true
where id = '11111111-1111-1111-1111-111111111104';

update public.users set
  avatar_url = 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop',
  bio = 'Home cook. Pure veg, non-veg, breakfast specials. Onam sadya bookings open.',
  is_verified = false
where id = '11111111-1111-1111-1111-111111111105';

update public.users set
  avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  bio = 'Electrician. Wiring, AC fix, fan install. Licensed. Available weekends too.',
  is_verified = true
where id = '11111111-1111-1111-1111-111111111106';

update public.users set
  avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  bio = 'Just here to get my pani done.'
where id = '22222222-2222-2222-2222-222222222201';

-- ---------------------------------------------------------------------
-- Step 3: Worker profiles
-- ---------------------------------------------------------------------
insert into public.worker_profiles
  (user_id, category, skills, hourly_rate, daily_rate, experience_years, availability, portfolio_urls, rating_avg, total_jobs_done, is_available)
values
  ('11111111-1111-1111-1111-111111111101', 'Cleaning',
    array['Deep clean','Daily clean','Window clean','Move-out clean'],
    250, 1500, 8,
    '{"mon":["09:00","17:00"],"tue":["09:00","17:00"],"wed":["09:00","17:00"],"thu":["09:00","17:00"],"fri":["09:00","17:00"],"sat":["09:00","13:00"]}'::jsonb,
    array['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&fit=crop','https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&fit=crop','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&fit=crop'],
    4.8, 142, true),

  ('11111111-1111-1111-1111-111111111102', 'Plumbing',
    array['Pipe leaks','Tap install','Tank fitting','Drain cleaning'],
    400, 2400, 12,
    '{"mon":["08:00","19:00"],"tue":["08:00","19:00"],"wed":["08:00","19:00"],"thu":["08:00","19:00"],"fri":["08:00","19:00"],"sat":["08:00","19:00"]}'::jsonb,
    array['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&fit=crop','https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&fit=crop','https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&fit=crop'],
    4.9, 320, true),

  ('11111111-1111-1111-1111-111111111103', 'Tutoring',
    array['Math','Physics','Class 8–12','Entrance prep'],
    500, 3000, 10,
    '{"mon":["16:00","20:00"],"tue":["16:00","20:00"],"wed":["16:00","20:00"],"thu":["16:00","20:00"],"fri":["16:00","20:00"],"sat":["10:00","18:00"]}'::jsonb,
    array['https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&fit=crop','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&fit=crop','https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&fit=crop'],
    4.7, 86, true),

  ('11111111-1111-1111-1111-111111111104', 'Driving',
    array['Long trips','City drives','Airport drops','School runs'],
    300, 1800, 15,
    '{"mon":["06:00","22:00"],"tue":["06:00","22:00"],"wed":["06:00","22:00"],"thu":["06:00","22:00"],"fri":["06:00","22:00"],"sat":["06:00","22:00"],"sun":["08:00","20:00"]}'::jsonb,
    array['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&fit=crop','https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&fit=crop','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&fit=crop'],
    4.6, 198, true),

  ('11111111-1111-1111-1111-111111111105', 'Cooking',
    array['Sadya','Daily meals','Non-veg','Tiffin'],
    350, 2000, 6,
    '{"mon":["07:00","11:00"],"tue":["07:00","11:00"],"wed":["07:00","11:00"],"thu":["07:00","11:00"],"fri":["07:00","11:00"],"sat":["07:00","13:00"],"sun":["07:00","13:00"]}'::jsonb,
    array['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&fit=crop','https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&fit=crop','https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&fit=crop'],
    4.5, 64, true),

  ('11111111-1111-1111-1111-111111111106', 'Electrical',
    array['AC service','Fan install','Wiring','Inverter setup'],
    380, 2200, 9,
    '{"mon":["09:00","18:00"],"tue":["09:00","18:00"],"wed":["09:00","18:00"],"thu":["09:00","18:00"],"fri":["09:00","18:00"],"sat":["09:00","18:00"],"sun":["10:00","15:00"]}'::jsonb,
    array['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&fit=crop','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&fit=crop','https://images.unsplash.com/photo-1544724107-6d5e44a4b080?w=600&fit=crop'],
    4.7, 175, true)

on conflict (user_id, category) do nothing;

-- ---------------------------------------------------------------------
-- Step 4: Sample open job requests
-- ---------------------------------------------------------------------
insert into public.job_requests
  (id, client_id, title, description, category, budget_min, budget_max, location, urgency, status, created_at)
values
  ('33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222201',
    'Need a deep clean for 2BHK before Onam',
    'Looking for someone to do a thorough deep clean of my 2BHK in Kakkanad. Kitchen, bathrooms, balconies — full works. This Saturday if possible.',
    'Cleaning', 1200, 2000, 'Kakkanad, Kochi', 'urgent', 'open', now() - interval '2 hours'),

  ('33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222201',
    'Class 10 maths tutor — twice a week',
    'My daughter is in Class 10 CBSE, struggling with trigonometry. Need a patient tutor twice a week, evenings. Trivandrum, Pattom area.',
    'Tutoring', 600, 900, 'Trivandrum', 'normal', 'open', now() - interval '6 hours'),

  ('33333333-3333-3333-3333-333333333303',
    '22222222-2222-2222-2222-222222222201',
    'Kitchen tap leaking — fix asap',
    'Tap under the kitchen sink leaking since morning. Need a plumber to come today and sort it. Mid-rise apartment, no parking issue.',
    'Plumbing', 300, 600, 'Aluva, Kochi', 'urgent', 'open', now() - interval '30 minutes'),

  ('33333333-3333-3333-3333-333333333304',
    '22222222-2222-2222-2222-222222222201',
    'Driver for weekend Munnar trip',
    'Family of 4. Friday evening to Sunday evening. Innova preferred. Driver should know the hill route. Will cover stay + food.',
    'Driving', 4500, 6000, 'Kochi → Munnar', 'normal', 'open', now() - interval '1 day'),

  ('33333333-3333-3333-3333-333333333305',
    '22222222-2222-2222-2222-222222222201',
    'Help with house move (3BR to nearby)',
    'Moving from current 3BR to a new place 4km away. Need 2-3 helpers + a tempo if possible. Sunday morning. Lots of furniture.',
    'Moving', 3500, 5500, 'Edappally, Kochi', 'normal', 'open', now() - interval '3 days')

on conflict (id) do nothing;
