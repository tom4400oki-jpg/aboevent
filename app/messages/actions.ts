'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAdminProfile } from '@/utils/admin'

export async function sendMessage(content: string, receiverId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    let targetId = receiverId

    // If no receiverId provided (from User POV), find Admin ID
    if (!targetId) {
        // DBからadminロールのユーザーを取得
        const adminProfile = await getAdminProfile()

        if (!adminProfile) return { error: 'Admin not found' }
        targetId = adminProfile.id
    }

    const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
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

