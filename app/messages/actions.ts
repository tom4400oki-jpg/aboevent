'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'tom4400oki@gmail.com'

export async function sendMessage(content: string, receiverId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    let targetId = receiverId

    // If no receiverId provided (from User POV), find Admin ID
    if (!targetId) {
        // Find admin user ID securely (assuming profiles table has email or we can search auth)
        // Since we can't query auth.users directly from client, we rely on profiles table or known ID.
        // For MVP, we will query the public.profiles table if it syncs email.
        // Previously we ensured profiles has email.
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', ADMIN_EMAIL)
            .single()

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
