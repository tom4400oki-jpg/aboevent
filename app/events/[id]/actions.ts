'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { getAdminProfile, getEffectiveUser } from '@/utils/admin'
import { sendSystemMessage } from '@/utils/messaging'
import { cookies } from 'next/headers'

const REFERRAL_COOKIE_NAME = 'referral_code'

export async function bookEvent(formData: FormData) {
    const supabase = await createClient()

    const eventId = formData.get('eventId') as string
    const transportation = formData.get('transportation') as string
    const pickup_needed = formData.get('pickup_needed') === 'on'

    // 1. Get user context
    const user = await getEffectiveUser() // The user to book for (could be dummy or helper)
    const { data: { user: realUser } } = await supabase.auth.getUser() // The actually logged-in user

    let targetUserId = user?.id
    let isGuest = false

    // ゲスト予約の処理 (ログインしていない場合)
    if (!targetUserId) {
        const guestName = formData.get('guest_name') as string
        const guestEmail = formData.get('guest_email') as string

        if (!guestName || !guestEmail) {
            return { error: '予約するにはログインするか、ゲスト情報を入力してください。' }
        }

        // Admin Clientでユーザー作成または取得
        const adminClient = createAdminClient()

        // 新規ユーザー作成
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email: guestEmail,
            password: tempPassword,
            email_confirm: true, // 自動確認済みにする
            user_metadata: { full_name: guestName }
        })

        if (createError) {
            console.error('Guest user creation error:', createError)
            // 重複エラーの場合 (Supabase Auth APIのエラーメッセージやステータスコードに依存)
            // 一般的に 422 Unprocessable Entity や 特定のメッセージが含まれる
            if (createError.message?.includes('already been registered') || createError.status === 422) {
                return { error: 'このメールアドレスは既に登録されています。ログインして予約してください。' }
            }
            return { error: 'ゲストユーザーの作成に失敗しました。' }
        }

        if (!newUser.user) {
            return { error: 'ゲストユーザーの作成に失敗しました（ユーザーデータなし）。' }
        }

        targetUserId = newUser.user.id
        isGuest = true

        // プロフィール作成 (Triggerで作成される場合もあるが、念のため/名前を確実に入れるため)
        // ※ トリガーで作成される場合、Duplicate Key Errorになる可能性があるため、upsertを使用
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: targetUserId,
                full_name: guestName,
                avatar_url: '',
                role: 'user'
            }, { onConflict: 'id' })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // プロフィール作成失敗しても予約は続行させるか？ -> 続行させる
        }
    }

    // Check if the real user acts as admin/moderator to bypass RLS if needed
    let useAdminClient = isGuest // ゲストの場合は必ずAdmin Clientを使用
    if (!isGuest && user && realUser && user.id !== realUser.id) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', realUser.id)
            .single()

        if (profile && (profile.role === 'admin' || profile.role === 'moderator')) {
            useAdminClient = true
        }
    }

    const dbClient = useAdminClient ? createAdminClient() : supabase

    // リファラルCookieから紹介者IDを取得
    const cookieStore = await cookies()
    const referrerIdFromCookie = cookieStore.get(REFERRAL_COOKIE_NAME)?.value || null
    // 自分自身を紹介者にしない
    const referrerId = (referrerIdFromCookie && referrerIdFromCookie !== targetUserId) ? referrerIdFromCookie : null

    // 2. Insert booking
    const { error: insertError } = await dbClient
        .from('bookings')
        .insert({
            event_id: eventId,
            user_id: targetUserId!,
            transportation,
            pickup_needed,
            referrer_id: referrerId,
        })

    if (insertError) {
        if (insertError.code === '23505') { // Unique violation
            return { error: '既にこのイベントは予約済みです。' }
        }
        console.error('Booking error:', insertError)
        return { error: '予約に失敗しました。もう一度お試しください。' }
    }


    // ...

    // 3. Send automated confirmation message
    const { data: event } = await supabase // Reading event info is public generally allowed
        .from('events')
        .select('title, start_at')
        .eq('id', eventId)
        .single()

    if (event) {
        const eventDate = new Date(event.start_at).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
        const messageContent = `イベントの予約が完了しました！🎉\n\n📅 イベント: ${event.title}\n⏰ 日時: ${eventDate}\n\n当日お会いできるのを楽しみにしています！\n不明点があれば、このチャットでいつでもご質問ください。`

        if (targetUserId) {
            await sendSystemMessage(targetUserId, messageContent)
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

    // 1. Get user context
    const user = await getEffectiveUser()
    const { data: { user: realUser } } = await supabase.auth.getUser()

    if (!user || !realUser) {
        return { error: 'Unauthorized' }
    }

    // Check permissions for RLS bypass
    let useAdminClient = false
    if (user.id !== realUser.id) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', realUser.id)
            .single()

        if (profile && (profile.role === 'admin' || profile.role === 'moderator')) {
            useAdminClient = true
        }
    }

    const dbClient = useAdminClient ? createAdminClient() : supabase

    // 1.5 Get event details BEFORE deleting booking (to send message)
    // Use admin client if impersonating to ensure we can read the booking of another user
    const { data: booking } = await dbClient
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
    const { error } = await dbClient
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

        const eventDate = new Date(eventStart).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
        const messageContent = `イベントのキャンセルを承りました。\n\n📅 キャンセルしたイベント: ${eventTitle}\n⏰ 日時: ${eventDate}\n\nまたのご参加を心よりお待ちしています。👋`

        await sendSystemMessage(user.id, messageContent)
    }

    // 4. Revalidate paths
    revalidatePath('/bookings')     // Update list
    revalidatePath('/events/[id]')  // Update specific event pages
    revalidatePath('/messages')     // Update messages
    revalidatePath('/')

    return { success: true }
}
