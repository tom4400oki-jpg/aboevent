-- Create messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) not null,
  receiver_id uuid references auth.users(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies for Messages
-- 1. Users can view messages where they are the sender or receiver
drop policy if exists "Users can view their own messages" on public.messages;
create policy "Users can view their own messages"
on public.messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- 2. Users can insert messages where they are the sender
drop policy if exists "Users can insert messages sent by them" on public.messages;
create policy "Users can insert messages sent by them"
on public.messages for insert
with check (auth.uid() = sender_id);

-- 3. Service Role (Admin Client) usually bypasses RLS, but we can add specific policy if needed.
-- For now, standard RLS + Admin Client (Service Role) is enough.

-- Index for performance
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);
create index if not exists messages_created_at_idx on public.messages(created_at);
