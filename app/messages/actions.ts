'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminProfile } from '@/utils/admin'

export async function sendMessage(content: string, receiverId?: string) {
    const supabase = await createClient()
    // 認証ユーザー(操作者)を取得
    const { data: { user: realUser } } = await supabase.auth.getUser()
    if (!realUser) return { error: 'Unauthorized' }

    // 送信者(なりすまし含む)を取得
    const { getEffectiveUser } = await import('@/utils/admin')
    const sender = await getEffectiveUser()

    if (!sender) return { error: 'User context not found' }

    // なりすまし判定
    let dbClient = supabase
    if (realUser.id !== sender.id) {
        const { createAdminClient } = await import('@/utils/supabase/admin-client')
        dbClient = createAdminClient()
    }

    let targetId = receiverId

    // If no receiverId provided (from User POV), find Admin ID
    if (!targetId) {
        // DBからadminロールのユーザーを取得
        const adminProfile = await getAdminProfile()

        if (!adminProfile) return { error: 'Admin not found' }
        targetId = adminProfile.id
    }

    const { error } = await dbClient.from('messages').insert({
        sender_id: sender.id, // ここを user.id から sender.id に変更
        receiver_id: targetId,
        content
    })

    if (error) {
        console.error('Message error:', error)
        return { error: 'Failed to send message' }
    }

    revalidatePath('/messages')
    revalidatePath(`/admin/messages`)
    return { success: true }
}

export async function markMessagesAsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Check effective user for impersonation logic
    // We need to know if we should act as another user or if we are impersonating
    // Actually, for marking read, we want to mark messages for the *Effective User*
    // but we need to check if *Real User* has permission (is admin) to do so if they differ.

    // Import dynamically to avoid circular deps if any, but actions.ts is safe.
    // copying logic from page.tsx but cleaner.

    const { getEffectiveUser } = await import('@/utils/admin')
    const effectiveUser = await getEffectiveUser()

    if (!effectiveUser) return

    let dbClient = supabase

    // Check if we are impersonating
    if (user.id !== effectiveUser.id) {
        // We are impersonating. Use Admin Client to bypass RLS if needed,
        // or to just ensure we can update the effective user's messages.
        const { createAdminClient } = await import('@/utils/supabase/admin-client')
        dbClient = createAdminClient()
    }

    const { error } = await dbClient
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', effectiveUser.id)
        .eq('is_read', false)

    if (error) {
        console.error('Failed to mark messages as read:', error)
        return { error: 'Failed to update' }
    }

    revalidatePath('/messages')
    revalidatePath('/', 'layout') // Update navbar badge
    return { success: true }
}

