-- リファラルトラッキング用カラム追加

-- profiles テーブルに紹介者IDを追加
alter table profiles
add column if not exists referred_by uuid references profiles(id);

-- bookings テーブルに紹介者IDを追加
alter table bookings
add column if not exists referrer_id uuid references profiles(id);

-- 紹介URLからの訪問記録テーブル
create table if not exists referral_visits (
    id uuid default gen_random_uuid() primary key,
    referrer_id uuid not null references profiles(id),
    path text not null default '/',
    visited_at timestamptz default now()
);

-- インデックス追加
create index if not exists idx_referral_visits_referrer_id on referral_visits(referrer_id);

-- RLSを有効化（service_role keyでアクセスするためポリシー不要）
alter table referral_visits enable row level security;

-- コメント追加
comment on column profiles.referred_by is '紹介者のユーザーID（?ref=パラメータから記録）';
comment on column bookings.referrer_id is '紹介者のユーザーID（?ref=パラメータから記録）';
comment on table referral_visits is '紹介URLからの訪問記録';
