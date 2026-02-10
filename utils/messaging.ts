import { createAdminClient } from '@/utils/supabase/admin-client'
import { getAdminProfile } from '@/utils/admin'

/**
 * システムメッセージ（管理者からの自動返信）を送信する
 * @param receiverId 受信者のユーザーID
 * @param content メッセージ本文
 */
export async function sendSystemMessage(receiverId: string, content: string) {
    console.log(`[SystemMessage] Sending to ${receiverId}...`)

    try {
        // 1. 管理者プロファイルの取得 (送信元IDとして使用)
        const adminProfile = await getAdminProfile()

        if (!adminProfile) {
            console.error('[SystemMessage] Error: No admin/moderator profile found. Cannot send message.')
            return { success: false, error: 'Admin profile not found' }
        }

        console.log(`[SystemMessage] Sender ID: ${adminProfile.id} (${adminProfile.full_name})`)

        // 2. Admin Clientを使用してメッセージを送信 (RLS回避)
        const supabase = createAdminClient()
        const { error } = await supabase.from('messages').insert({
            sender_id: adminProfile.id,
            receiver_id: receiverId,
            content: content,
            is_read: false
        })

        if (error) {
            console.error('[SystemMessage] Insert Error:', error)
            return { success: false, error: error.message }
        }

        console.log('[SystemMessage] Successfully sent.')
        return { success: true }

    } catch (e) {
        console.error('[SystemMessage] Unexpected Error:', e)
        return { success: false, error: 'Unexpected error' }
    }
}
