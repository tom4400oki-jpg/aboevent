import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ReserveButton from './reserve-button'
import Link from 'next/link'
import EventGallery from '@/components/event-gallery'
import { canManageEvents } from '@/utils/admin'
import { formatEventDate, formatEventTimeRange } from '@/utils/date'

import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()

    const { data: event } = await supabase
        .from('events')
        .select('title, description, image_url, category')
        .eq('id', id)
        .single()

    if (!event) return { title: 'イベント詳細' }

    return {
        title: event.title,
        description: event.description || `${event.category || 'イベント'}の詳細情報です。`,
        openGraph: {
            title: `${event.title} | Funny-Spo`,
            description: event.description || '横浜・戸塚で活動する社会人スポーツサークル Funny-Spo',
            images: event.image_url ? [{ url: event.image_url }] : [],
        },
    }
}

interface Event {
    id: string
    title: string
    start_at: string
    end_at: string
    location: string
    nearest_station: string | null
    price: number | null
    description: string | null
    image_url: string | null
    category?: string
    ask_transportation: boolean
    transportation_info: string | null
    latitude: number | null
    longitude: number | null
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
            .select('id, title, start_at, end_at, location, nearest_station, price, description, image_url, category, ask_transportation, transportation_info')
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

        const isAdminUser = await canManageEvents()
        const isExpired = new Date(event.start_at) < new Date()

        // Fetch all events for the map
        const { data: allEvents } = await supabase
            .from('events')
            .select('id, title, latitude, longitude, category')

        // Fetch gallery images from reports
        const { data: reportImages } = await supabase
            .from('report_images')
            .select(`
                image_url,
                event_reports!inner (event_id)
            `)
            .eq('event_reports.event_id', id)

        const galleryImages = (reportImages || []).map((img: any) => img.image_url)

        const mapEvents = (allEvents || []).map(e => ({
            id: e.id,
            title: e.title,
            latitude: e.latitude,
            longitude: e.longitude,
            category: e.category
        }))

        // 構造化データ (JSON-LD) の生成
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: event.title,
            startDate: event.start_at,
            endDate: event.end_at,
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            eventStatus: 'https://schema.org/EventScheduled',
            location: {
                '@type': 'Place',
                name: event.location,
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: event.location, // 詳細な住所がない場合は場所名を使用
                    addressLocality: '横浜市',    // デフォルト値として横浜市を設定
                    addressRegion: '神奈川県',
                    addressCountry: 'JP'
                }
            },
            image: event.image_url ? [event.image_url] : [],
            description: event.description || `${event.category || 'イベント'}の詳細です。`,
            performer: {
                '@type': 'Organization',
                name: 'Funny-Spo'
            },
            offers: {
                '@type': 'Offer',
                price: event.price || 0,
                priceCurrency: 'JPY',
                availability: isExpired ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
                url: `https://funny-spo.netlify.app/events/${event.id}`,
                validFrom: event.created_at || new Date().toISOString()
            },
            organizer: {
                '@type': 'Organization',
                name: 'Funny-Spo',
                url: 'https://funny-spo.netlify.app'
            }
        }

        return (
            <div className="min-h-screen bg-gray-50 pb-12">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                {/* Hero Section with Image */}
                {/* ... existing code ... */}
                <div className="relative h-[40vh] min-h-[300px] w-full bg-gray-900">
                    {event.image_url ? (
                        <img
                            src={event.image_url}
                            alt={event.title}
                            className={`h-full w-full object-cover ${isExpired ? 'grayscale-[0.5]' : ''}`}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-6xl">
                            🗓️
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/80 to-transparent">
                        <div className="max-w-4xl mx-auto flex items-end justify-between px-4 sm:px-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2 text-xs font-bold uppercase tracking-wider">
                                    <span className="rounded bg-indigo-600 px-2 py-1">
                                        {event.category || 'イベント'}
                                    </span>
                                    <span className={`rounded px-2 py-1 ${isExpired ? 'bg-gray-500' : 'bg-green-500'}`}>
                                        {isExpired ? '受付終了' : '募集中'}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-extrabold md:text-4xl">{event.title}</h1>
                            </div>
                            {/* Admin Edit Button */}
                            {isAdminUser && (
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
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                            ← イベント一覧に戻る
                        </Link>
                    </div>

                    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="p-6 sm:p-8 space-y-8">
                            {/* Info Grid */}
                            <div className="grid gap-6 sm:grid-cols-3">
                                <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                                    <div className="text-sm font-semibold text-indigo-600 mb-1">日時</div>
                                    <div className="font-bold text-gray-900">
                                        {formatEventDate(event.start_at)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {formatEventTimeRange(event.start_at, event.end_at)}
                                    </div>
                                </div>

                                <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                                    <div className="text-sm font-semibold text-indigo-600 mb-1">場所</div>
                                    <div className="font-bold text-gray-900">{event.location}</div>
                                    {event.nearest_station && (
                                        <div className="text-sm text-gray-600">
                                            ({event.nearest_station})
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                                    <div className="text-sm font-semibold text-indigo-600 mb-1">価格</div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="font-bold text-gray-900 text-xl">¥{event.price?.toLocaleString() ?? 0}</div>
                                        <div className="text-xs font-bold text-indigo-500">(当日現地払い)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Access Info */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 text-green-900 border border-green-100 mb-4">
                                <span className="text-2xl">🚙</span>
                                <div>
                                    <div className="text-xs font-bold text-green-600 uppercase tracking-wide">アクセス・送迎</div>
                                    <div className="font-medium">
                                        {event.transportation_info ? (
                                            event.transportation_info
                                        ) : (
                                            <>
                                                {event.nearest_station && <strong>{event.nearest_station}</strong>}
                                                {event.ask_transportation && (
                                                    <span>{event.nearest_station ? 'より' : ''}送迎可 (要相談)</span>
                                                )}
                                                {!event.nearest_station && !event.ask_transportation && (
                                                    <span className="text-gray-400 italic">情報なし</span>
                                                )}
                                            </>
                                        )}
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
                            <EventGallery images={galleryImages} />
                        </div>
                    </article>
                </div>

                <ReserveButton
                    eventId={event.id}
                    loggedIn={isLoggedIn}
                    isBooked={isBooked}
                    disabled={isExpired}
                    askTransportation={event.ask_transportation}
                />
            </div>
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
