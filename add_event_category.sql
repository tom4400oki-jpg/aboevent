-- Add category column
alter table public.events 
add column if not exists category text check (category in ('tennis', 'futsal', 'other'));

-- Update existing events based on title
update public.events set category = 'futsal' where title like '%サル%' or title like '%フットサル%';
update public.events set category = 'tennis' where title like '%テニス%';
update public.events set category = 'other' where category is null;
