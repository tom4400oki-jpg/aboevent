'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function bookEvent(eventId: string) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: '予約するにはログインが必要です。' }
    }

    // 2. Insert booking
    const { error: insertError } = await supabase
        .from('bookings')
        .insert({
            event_id: eventId,
            user_id: user.id,
        })

    if (insertError) {
        if (insertError.code === '23505') { // Unique violation
            return { error: '既にこのイベントは予約済みです。' }
        }
        console.error('Booking error:', insertError)
        return { error: '予約に失敗しました。もう一度お試しください。' }
    }

    // 3. Revalidate page
    revalidatePath(`/events/${eventId}`)
    return { success: true }
}
