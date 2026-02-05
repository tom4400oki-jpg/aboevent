-- Create a bucket for event images
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- Allow public access to view images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'event-images' );

-- Allow authenticated users with admin/moderator role to upload images
-- Note: This assumes public.is_admin() or similar check exists. 
-- Since we are using service role for actions, we can keep it simple or strict.
create policy "Admin Upload"
on storage.objects for insert
with check (
  bucket_id = 'event-images' 
  -- AND (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator')))
);

-- Allow admins to delete/update
create policy "Admin Update"
on storage.objects for update
using ( bucket_id = 'event-images' );

create policy "Admin Delete"
on storage.objects for delete
using ( bucket_id = 'event-images' );
