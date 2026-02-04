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
