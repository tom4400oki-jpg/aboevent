-- ダミーユーザー（視聴用アカウント）の作成
-- 注意: auth.users にもレコードを作成して外部キー制約を満たす必要があります

-- 1. auth.users にダミーユーザーを作成
-- パスワードは無効なハッシュを設定し、ログイン不可能にする
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
)
VALUES (
    '00000000-0000-0000-0000-000000000000', -- 固定UUID
    '00000000-0000-0000-0000-000000000000', -- instance_id (Supabaseのデフォルト)
    'viewer@funny-spo.com',
    '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhash', -- 無効なハッシュ
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    'authenticated',
    'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- 2. profiles にダミーユーザーを作成（トリガーで作成されている可能性もあるためON CONFLICTで更新）
INSERT INTO public.profiles (
    id,
    email,
    role,
    full_name,
    avatar_url,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'viewer@funny-spo.com',
    'user',
    '一般ユーザー（表示確認用）',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer',
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE
SET
    role = 'user',
    full_name = '一般ユーザー（表示確認用）',
    email = EXCLUDED.email; -- emailも念のため更新
