-- Allow users to update messages received by them (e.g. marking as read)
create policy "Users can update messages received by them"
on public.messages for update
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);
