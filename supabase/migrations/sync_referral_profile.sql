-- リファラルコード（メタデータ）から紹介者を自動紐付けするトリガー

-- 1. トリガー関数
create or replace function public.handle_new_user_referral()
returns trigger as $$
declare
  referrer_code text;
  referrer_uuid uuid;
begin
  -- メタデータから紹介コードを取得
  referrer_code := new.raw_user_meta_data->>'referral_code';

  -- 紹介コードがある場合のみ処理
  if referrer_code is not null then
    -- profilesテーブルからコードが一致するユーザーID（UUID）を検索
    select id into referrer_uuid from public.profiles where referral_code = referrer_code limit 1;

    -- 紹介者が見つかった場合、新しいユーザーのreferred_byを更新
    if referrer_uuid is not null then
      update public.profiles
      set referred_by = referrer_uuid
      where id = new.id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 2. トリガー作成（auth.usersのINSERT直後はまだprofilesがない可能性があるため、profilesが作成された後に動かすのが安全だが、profiles作成自体がトリガーで行われている場合競合する可能性がある）
-- 安全策: public.profilesに対するUPDATE/INSERTトリガーにするか、auth.usersに対するトリガーにするか。
-- ここでは、auth.users にユーザーが作成されたとき、Supabaseの一般的なパターンとして `handle_new_user` が走って `profiles` が作られる。
-- そのため、このトリガーは `public.profiles` に対する `INSERT` トリガーとして定義し、自分自身を更新する（referred_byをセットする）のが最も整合性が高いが、
-- BEFORE INSERT であれば `NEW.referred_by` をセットできる。

create or replace function public.set_referred_by_on_profile_insert()
returns trigger as $$
declare
  auth_user auth.users;
  referrer_code text;
  referrer_uuid uuid;
begin
  -- 既に入っている場合は何もしない
  if new.referred_by is not null then
    return new;
  end if;

  -- auth.usersからメタデータを取得
  select * into auth_user from auth.users where id = new.id;
  
  -- メタデータからコード取得
  referrer_code := auth_user.raw_user_meta_data->>'referral_code';

  if referrer_code is not null then
    -- 紹介者IDを検索
    select id into referrer_uuid from public.profiles where referral_code = referrer_code limit 1;
    
    -- セット
    if referrer_uuid is not null then
      new.referred_by := referrer_uuid;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- トリガーの登録
drop trigger if exists on_profile_insert_set_referrer on public.profiles;
create trigger on_profile_insert_set_referrer
  before insert on public.profiles
  for each row execute procedure public.set_referred_by_on_profile_insert();
