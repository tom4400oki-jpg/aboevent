-- Comprehensive DB Fix Script for AboEvent

-- 1. Ensure public.profiles table has all required columns
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamptz,
  full_name text,
  avatar_url text,
  email text
);

-- Ensure columns exist id the table already existed
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'email') then
    alter table public.profiles add column email text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name') then
    alter table public.profiles add column full_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url') then
    alter table public.profiles add column avatar_url text;
  end if;
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'updated_at') then
    alter table public.profiles add column updated_at timestamptz;
  end if;
end $$;

-- 2. Clean up old triggers/functions to ensure fresh start
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 3. Create the Trigger Function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- 4. Create the Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Backfill missing profiles (for existing users)
insert into public.profiles (id, email)
select id, email from auth.users
where id not in (select id from public.profiles);

-- 6. Backfill missing emails (for profiles that exist but have null email)
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- 7. Fix Permissions (RLS)
alter table public.profiles enable row level security;

-- Re-create policies to be safe (drop first to avoid errors)
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile"
on public.profiles for select
using ( auth.uid() = id );

create policy "Users can update own profile"
on public.profiles for update
using ( auth.uid() = id );

create policy "Users can insert own profile"
on public.profiles for insert
with check ( auth.uid() = id );
