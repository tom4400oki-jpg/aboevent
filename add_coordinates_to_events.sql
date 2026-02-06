-- Add latitude and longitude to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS longitude double precision;
