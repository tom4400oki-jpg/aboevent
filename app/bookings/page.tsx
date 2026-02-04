import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CancelButton from '@/components/cancel-button'

export default async function BookingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user's bookings with event details
    const { data: bookings } = await supabase
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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking: any) => {
                        // Handle potential array response for joined table
                        const event = Array.isArray(booking.events) ? booking.events[0] : (booking.events as any)

                        if (!event) return null

                        return (
                            <div
                                key={booking.id}
                                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
                            >
                                <Link href={`/events/${event.id}`} className="block flex-1 group-hover:opacity-95 transition-opacity">
                                    <div className="aspect-[16/9] w-full bg-gray-100 relative overflow-hidden">
                                        {event.image_url ? (
                                            <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-4xl">
                                                🗓️
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 rounded-full bg-green-500/90 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                                            予約済み
                                        </div>
                                    </div>

                                    <div className="p-5 pb-2">
                                        <div className="text-sm font-bold text-indigo-600 mb-2">
                                            {new Date(event.start_at).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                            {event.title}
                                        </h3>
                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                            <span>📍</span> {event.location}
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-5 pt-2 mt-auto">
                                    <div className="flex justify-end pt-3 border-t border-gray-100">
                                        <CancelButton bookingId={booking.id} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </main>
    )
}
