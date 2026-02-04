-- Add booking options
alter table public.bookings 
add column if not exists transportation text,
add column if not exists pickup_needed boolean default false;

comment on column public.bookings.transportation is 'car, train, other';
