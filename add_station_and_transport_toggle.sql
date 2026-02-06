ALTER TABLE public.events ADD COLUMN IF NOT EXISTS nearest_station text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ask_transportation boolean DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS transportation_info text;
