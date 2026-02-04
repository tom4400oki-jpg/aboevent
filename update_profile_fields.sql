-- Add extended profile fields (Updated)
alter table public.profiles 
add column if not exists gender text,
add column if not exists birthdate date,
add column if not exists residence text,  -- Added residence
add column if not exists tennis_level integer check (tennis_level between 1 and 5),
add column if not exists futsal_level integer check (futsal_level between 1 and 5),
add column if not exists referral_source text;

comment on column public.profiles.tennis_level is '1:初心者 - 5:上級者';
comment on column public.profiles.futsal_level is '1:初心者 - 5:上級者';
