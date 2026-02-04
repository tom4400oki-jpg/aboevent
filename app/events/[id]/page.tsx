import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ReserveButton from './reserve-button'
import Link from 'next/link'
import EventGallery from '@/components/event-gallery'
import { canManageEvents } from '@/utils/admin'

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
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: eventData, error } = await supabase
            .from('events')
            .select('id, title, start_at, location, price, description, image_url')
            .eq('id', id)
            .single()

        if (error || !eventData) {
            console.error('Event fetch error:', error)
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
                        <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white w-full flex justify-between items-end">
                            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight drop-shadow-md flex-1">
                                {event.title}
                            </h1>

                            {/* Admin Edit Button */}
                            {(await canManageEvents()) && (
                                <Link
                                    href={`/admin/events/${event.id}/edit`}
                                    className="ml-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                                >
                                    <span>✏️</span>
                                    <span>編集</span>
                                </Link>
                            )}
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

                        {/* Payment & Access Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 text-orange-900 border border-orange-100">
                                <span className="text-2xl">💰</span>
                                <div>
                                    <div className="text-xs font-bold text-orange-600 uppercase tracking-wide">お支払い</div>
                                    <div className="font-medium">当日<strong>現地払い</strong>でお願いします</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 text-green-900 border border-green-100">
                                <span className="text-2xl">🚙</span>
                                <div>
                                    <div className="text-xs font-bold text-green-600 uppercase tracking-wide">アクセス・送迎</div>
                                    <div className="font-medium"><strong>東戸塚駅</strong>より送迎可 (※要相談)</div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Description */}
                        <div className="prose prose-indigo max-w-none text-gray-600">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">イベント詳細</h3>
                            <p className="whitespace-pre-wrap leading-relaxed">{event.description || '詳細情報はありません。'}</p>
                        </div>
                    </div>

                    {/* Gallery Section */}
                    <div className="border-t border-gray-100 p-6 sm:p-8 bg-gray-50/50">
                        <EventGallery />
                    </div>
                </article>

                <ReserveButton
                    eventId={event.id}
                    loggedIn={isLoggedIn}
                    isBooked={isBooked}
                />
            </main >
        )
    } catch (e: any) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 max-w-lg">
                    <h2 className="text-red-700 font-bold text-lg mb-2">イベントの読み込みに失敗しました</h2>
                    <p className="text-red-600 font-mono text-sm break-all">
                        {e.message || JSON.stringify(e)}
                    </p>
                    <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
                        トップページへ戻る
                    </Link>
                </div>
            </div>
        )
    }
}
