-- 1. Ensure updated_at column exists
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'updated_at') then
    alter table public.profiles add column updated_at timestamptz;
  end if;
end $$;

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create policies
-- Allow users to view their own profile
create policy "Users can view own profile"
on public.profiles for select
using ( auth.uid() = id );

-- Allow users to update their own profile
create policy "Users can update own profile"
on public.profiles for update
using ( auth.uid() = id );

-- Allow users to insert their own profile (if not prevented by trigger logic)
create policy "Users can insert own profile"
on public.profiles for insert
with check ( auth.uid() = id );

-- (Optional) If you want public to view profiles (e.g. for comments), change the select policy:
-- create policy "Public profiles are viewable by everyone"
-- on public.profiles for select
-- using ( true );
