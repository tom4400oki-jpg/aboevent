'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'ログインが必要です。' }
    }

    const fullName = formData.get('fullName') as string
    const gender = formData.get('gender') as string
    const birthdate = formData.get('birthdate') as string
    const residence = formData.get('residence') as string
    const tennis_level = formData.get('tennis_level') ? parseInt(formData.get('tennis_level') as string) : null
    const futsal_level = formData.get('futsal_level') ? parseInt(formData.get('futsal_level') as string) : null
    const referral_source = formData.get('referral_source') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            gender,
            birthdate: birthdate || null,
            residence,
            tennis_level,
            futsal_level,
            referral_source,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'プロフィールの更新に失敗しました。' }
    }

    revalidatePath('/mypage')
    return { success: true, message: 'プロフィールを更新しました。' }
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'ログインが必要です。' }
    }

    const file = formData.get('avatar') as File
    if (!file) {
        return { error: 'ファイルが選択されていません。' }
    }

    // 現在のプロフィールを取得して古いアバターURLを確認
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

    // ファイル拡張子を取得
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Supabase Storageにアップロード
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
        })

    if (uploadError) {
        console.error('Upload error:', uploadError)
        return { error: '画像のアップロードに失敗しました。' }
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl
    console.log('Avatar Public URL:', avatarUrl)

    // profilesテーブルを更新
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Profile update error:', updateError)
        return { error: 'プロフィールの更新に失敗しました。' }
    }

    // 古いアバター画像を削除 (更新成功後)
    if (currentProfile?.avatar_url) {
        try {
            const oldUrl = currentProfile.avatar_url
            // URLからファイルパスを抽出 (例: .../avatars/user-123.jpg -> avatars/user-123.jpg)
            // supabase.storage.from('avatars').getPublicUrl() の形式に依存
            const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/`

            if (oldUrl.includes('avatars/')) {
                // URLの形式からパスを抽出する簡易的な方法
                const oldPath = oldUrl.split('/avatars/').pop()
                if (oldPath) {
                    await supabase.storage
                        .from('avatars')
                        .remove([`avatars/${oldPath}`]) // バケット名が含まれていない場合は調整が必要だが、通常はパス指定
                    // getPublicUrlは .../avatars/avatars/filename を返すことがあるので注意
                    // filePathは avatars/filename なので、
                    // getPublicUrlの結果は .../public/avatars/avatars/filename
                }

                // より確実なパス抽出: upload時のfilePath形式に合わせる
                // 古い画像が `avatars/${user.id}-...` の形式であることを期待
                const pathParts = oldUrl.split('/')
                const oldFileName = pathParts[pathParts.length - 1]
                if (oldFileName && oldFileName !== fileName) { // 今アップロードしたものと違う場合のみ
                    await supabase.storage
                        .from('avatars')
                        .remove([`avatars/${oldFileName}`])
                }
            }
        } catch (e) {
            console.error('Failed to delete old avatar:', e)
            // 古い画像の削除失敗は致命的ではないのでエラーにはしない
        }
    }

    revalidatePath('/mypage')
    return { success: true, avatarUrl }
}


