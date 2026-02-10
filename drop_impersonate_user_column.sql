-- profilesテーブルから不要になったimpersonate_user_idカラムを削除
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS impersonate_user_id;
