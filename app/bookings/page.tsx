import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CancelButton from '@/components/cancel-button'
import { getEffectiveUser } from '@/utils/admin'

import { createAdminClient } from '@/utils/supabase/admin-client'

export default async function BookingsPage() {
    const supabase = await createClient()
    const user = await getEffectiveUser()

    if (!user) {
        redirect('/login')
    }

    // Check for impersonation to bypass RLS
    const { data: { user: realUser } } = await supabase.auth.getUser()
    let dbClient = supabase

    if (realUser && user.id !== realUser.id) {
        // Fetch ACTUAL user's role, not the effective user's role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', realUser.id)
            .single()

        const role = profile?.role
        if (role === 'admin' || role === 'moderator') {
            dbClient = createAdminClient()
        }
    }

    // Fetch user's bookings with event details
    const { data: bookings } = await dbClient
        .from('bookings')
        .select(`
            id,
            created_at,
            events (
                id,
                title,
                start_at,
                location,
                image_url
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <main className="mx-auto max-w-4xl space-y-10 py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span>🎟️</span> 予約済みのイベント
            </h1>

            {!bookings || bookings.length === 0 ? (
                <div className="text-center p-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="text-6xl mb-4">🎫</div>
                    <p className="text-xl font-bold text-gray-900 mb-2">まだ予約したイベントはありません</p>
                    <p className="text-gray-500 mb-8">気になるイベントを見つけて参加しましょう！</p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                    >
                        イベントを探す
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map((booking: any) => {
                        const event = Array.isArray(booking.events) ? booking.events[0] : (booking.events as any)
                        if (!event) return null

                        return (
                            <div
                                key={booking.id}
                                className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex items-center p-3 sm:p-4 gap-4"
                            >
                                {/* Small Thumbnail */}
                                <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    {event.image_url ? (
                                        <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-xl">
                                            🗓️
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] sm:text-xs font-bold text-indigo-600 mb-0.5">
                                        {new Date(event.start_at).toLocaleDateString('ja-JP', {
                                            month: 'short',
                                            day: 'numeric',
                                            weekday: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <Link href={`/events/${event.id}`}>
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate group-hover:text-indigo-600 transition-colors">
                                            {event.title}
                                        </h3>
                                    </Link>
                                    <div className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">
                                        📍 {event.location}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0">
                                    <CancelButton bookingId={booking.id} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </main>
    )
}
