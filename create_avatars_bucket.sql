-- Supabase Storageにavatarsバケットを作成
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- アップロードポリシー: 認証済みユーザーは自分のアバターをアップロード可能
create policy "Users can upload own avatar"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'avatars' 
    and (storage.foldername(name))[1] = 'avatars'
);

-- 更新ポリシー: 認証済みユーザーは自分のアバターを更新可能
create policy "Users can update own avatar"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');

-- 削除ポリシー: 認証済みユーザーは自分のアバターを削除可能
create policy "Users can delete own avatar"
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars');

-- 閲覧ポリシー: 誰でもアバターを閲覧可能（公開バケット）
create policy "Anyone can view avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');
