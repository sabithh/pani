-- Migration: add lat/lng coordinates for proximity search
-- Run this in Supabase SQL Editor if you already ran schema.sql

alter table public.users
  add column if not exists lat numeric,
  add column if not exists lng numeric;

alter table public.job_requests
  add column if not exists lat numeric,
  add column if not exists lng numeric;
