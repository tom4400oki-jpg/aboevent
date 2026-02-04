-- 1. Add email column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'email') then
    alter table public.profiles add column email text;
  end if;
end $$;

-- 2. Update the trigger function to include email on new user creation
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

-- 3. Backfill existing profiles with email from auth.users
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;
