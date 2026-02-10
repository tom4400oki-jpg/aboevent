-- 管理者がプレビュー（なりすまし）に使用するターゲットユーザーIDを保存するカラムを追加
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS impersonate_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.impersonate_user_id IS '管理者プレビューモード時に使用する、なりすまし対象のユーザーID';
