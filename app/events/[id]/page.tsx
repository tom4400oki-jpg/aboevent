import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ReserveButton from './reserve-button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Event {
    id: string
    title: string
    start_at: string
    location: string
    price: number | null
    description: string | null
    image_url: string | null
}

export default async function EventPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: eventData, error } = await supabase
        .from('events')
        .select('id, title, start_at, location, price, description, image_url')
        .eq('id', id)
        .single()

    if (error || !eventData) {
        notFound()
    }

    const event = eventData as Event

    const { data: { user } } = await supabase.auth.getUser()
    const isLoggedIn = !!user

    let isBooked = false
    if (user) {
        const { data: booking } = await supabase
            .from('bookings')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .single()
        if (booking) isBooked = true
    }

    return (
        <main className="pb-28">
            {/* Back Button */}
            <div className="mb-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    ← イベント一覧に戻る
                </Link>
            </div>

            <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                {/* Hero Image */}
                <div className="relative h-64 sm:h-80 w-full bg-gray-200">
                    {event.image_url ? (
                        <img
                            src={event.image_url}
                            alt={event.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-200">
                            <span className="text-6xl">📷</span>
                            <span className="mt-2 text-sm font-medium">No Image</span>
                        </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white w-full">
                        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight drop-shadow-md">
                            {event.title}
                        </h1>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {/* Info Grid */}
                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                            <div className="text-sm font-semibold text-indigo-600 mb-1">日時</div>
                            <div className="font-bold text-gray-900">
                                {new Date(event.start_at).toLocaleDateString('ja-JP', {
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'short'
                                })}
                            </div>
                            <div className="text-sm text-gray-600">
                                {new Date(event.start_at).toLocaleTimeString('ja-JP', {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>

                        <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                            <div className="text-sm font-semibold text-indigo-600 mb-1">場所</div>
                            <div className="font-bold text-gray-900">{event.location}</div>
                        </div>

                        <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                            <div className="text-sm font-semibold text-indigo-600 mb-1">価格</div>
                            <div className="font-bold text-gray-900">¥{event.price?.toLocaleString() ?? 0}</div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Description */}
                    <div className="prose prose-indigo max-w-none text-gray-600">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">イベント詳細</h3>
                        <p className="whitespace-pre-wrap leading-relaxed">{event.description || '詳細情報はありません。'}</p>
                    </div>
                </div>
            </article>

            <ReserveButton
                eventId={event.id}
                loggedIn={isLoggedIn}
                isBooked={isBooked}
            />
        </main>
    )
}
