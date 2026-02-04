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
    // Avatar URL update logic could be added here later

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'プロフィールの更新に失敗しました。' }
    }

    revalidatePath('/mypage')
    return { success: true, message: 'プロフィールを更新しました。' }
}
