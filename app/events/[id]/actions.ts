'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { getAdminProfile } from '@/utils/admin'

export async function bookEvent(formData: FormData) {
    const supabase = await createClient()

    const eventId = formData.get('eventId') as string
    const transportation = formData.get('transportation') as string
    const pickup_needed = formData.get('pickup_needed') === 'on'

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
            transportation,
            pickup_needed
        })

    if (insertError) {
        if (insertError.code === '23505') { // Unique violation
            return { error: '既にこのイベントは予約済みです。' }
        }
        console.error('Booking error:', insertError)
        return { error: '予約に失敗しました。もう一度お試しください。' }
    }

    // 3. Send automated confirmation message
    const { data: event } = await supabase
        .from('events')
        .select('title, start_at')
        .eq('id', eventId)
        .single()

    if (event) {
        // Find Admin ID
        const adminProfile = await getAdminProfile()

        if (adminProfile) {
            const eventDate = new Date(event.start_at).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })

            const messageContent = `イベントの予約が完了しました！🎉\n\n📅 イベント: ${event.title}\n⏰ 日時: ${eventDate}\n\n当日お会いできるのを楽しみにしています！\n不明点があれば、このチャットでいつでもご質問ください。`

            await supabase.from('messages').insert({
                sender_id: adminProfile.id,
                receiver_id: user.id,
                content: messageContent,
                is_read: false
            })
        }
    }

    // 4. Revalidate page
    revalidatePath(`/events/${eventId}`)
    revalidatePath('/bookings')
    revalidatePath('/messages')
    return { success: true }
}

export async function cancelBooking(bookingId: string) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1.5 Get event details BEFORE deleting booking (to send message)
    const { data: booking } = await supabase
        .from('bookings')
        .select(`
            events (
                title,
                start_at
            )
        `)
        .eq('id', bookingId)
        .single()

    // 2. Delete booking
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Cancellation error:', error)
        return { error: 'キャンセルに失敗しました。' }
    }

    // 3. Send automated cancellation message
    if (booking && booking.events) {
        const eventsData = Array.isArray(booking.events) ? booking.events[0] : booking.events
        const eventTitle = eventsData?.title
        const eventStart = eventsData?.start_at

        // Find Admin ID
        const adminProfile = await getAdminProfile()

        if (adminProfile) {
            const eventDate = new Date(eventStart).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })

            const messageContent = `イベントのキャンセルを承りました。\n\n📅 キャンセルしたイベント: ${eventTitle}\n⏰ 日時: ${eventDate}\n\nまたのご参加を心よりお待ちしています。👋`

            await supabase.from('messages').insert({
                sender_id: adminProfile.id,
                receiver_id: user.id,
                content: messageContent,
                is_read: false
            })
        }
    }

    // 4. Revalidate paths
    revalidatePath('/bookings')     // Update list
    revalidatePath('/events/[id]')  // Update specific event pages
    revalidatePath('/messages')     // Update messages
    revalidatePath('/')

    return { success: true }
}
