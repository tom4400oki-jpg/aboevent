import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 0

interface Event {
    id: string
    title: string
    start_at: string
    location: string
    price: number | null
}

export default async function Home() {
    const supabase = await createClient()

    const { data: events, error } = await supabase
        .from('events')
        .select('id, title, start_at, location, price')
        .order('start_at', { ascending: true })

    if (error) {
        console.error('Error fetching events:', error)
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <p className="text-red-500 text-center">
                    イベントの読み込み中にエラーが発生しました。
                </p>
            </div>
        )
    }

    // Cast the data to our interface
    const typedEvents = events as unknown as Event[]

    return (
        <main className="space-y-8">
            {/* Hero Section */}
            <section className="rounded-2xl bg-indigo-600 px-6 py-12 text-center shadow-xl sm:px-12 md:py-16 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4">
                        新しい体験を見つけよう
                    </h2>
                    <p className="text-indigo-100 text-lg sm:text-xl">
                        あなたの興味に合ったイベントがきっと見つかります。
                    </p>
                </div>
                {/* Decorative Circle */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl"></div>
            </section>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">募集中イベント</h2>
                </div>

                {!typedEvents || typedEvents.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 text-center">
                        <div className="text-4xl mb-4">😢</div>
                        <p className="text-gray-500 font-medium">現在募集中のイベントはありません</p>
                        <p className="text-gray-400 text-sm mt-2">新しいイベントの追加をお待ちください</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {typedEvents.map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.id}`}
                                className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-lg"
                            >
                                {/* Card Image Placeholder */}
                                <div className="aspect-[16/9] w-full bg-gray-100 relative overflow-hidden">
                                    {/* If we had images in the list, we would show them here. For now, a placeholder pattern */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                                        🗓️
                                    </div>
                                    <div className="absolute top-2 right-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm backdrop-blur-sm">
                                        募集中
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="mb-3 text-sm font-semibold text-indigo-600">
                                        {new Date(event.start_at).toLocaleDateString('ja-JP', {
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short',
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <h3 className="mb-3 text-lg font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <div className="mt-auto flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span>📍</span>
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                        <div className="font-bold text-gray-900 whitespace-nowrap pl-2">
                                            ¥{event.price?.toLocaleString() ?? 0}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
