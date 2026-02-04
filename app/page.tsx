import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

interface Event {
    id: string
    title: string
    start_at: string
    location: string
    price: number | null
    category?: string
}

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>
}) {
    try {
        const { category } = await searchParams
        const supabase = await createClient()

        let query = supabase
            .from('events')
            .select('id, title, start_at, location, price, category')
            .order('start_at', { ascending: true })

        if (category && category !== 'all') {
            query = query.eq('category', category)
        }

        const { data: events, error } = await query

        if (error) {
            throw new Error(`Database Error: ${error.message}`)
        }

        // Cast the data
        const typedEvents = events as unknown as Event[]

        return (
            <main className="space-y-8">
                {/* Hero Section */}
                <section className="relative rounded-3xl bg-indigo-900 overflow-hidden shadow-2xl">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80"
                            alt="Sports background"
                            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/80"></div>
                    </div>

                    <div className="relative z-10 px-6 py-20 text-center sm:px-12 md:py-28">
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-500/20 text-orange-300 font-bold tracking-wide text-sm backdrop-blur-sm border border-orange-500/30">
                            LET'S PLAY TOGETHER! 🎾 ⚽
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6 drop-shadow-lg">
                            新しい<span className="text-orange-400">体験</span>を、<br className="sm:hidden" />
                            ここから始めよう
                        </h2>
                        <p className="mx-auto max-w-2xl text-indigo-100 text-lg sm:text-xl mb-6 leading-relaxed font-medium">
                            テニス、フットサル、そして新しい仲間。<br />
                            あなたの日常に「熱狂」と「笑顔」をプラスします。
                        </p>
                    </div>
                </section>

                <div className="space-y-6" id="events">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">募集中イベント</h2>

                        {/* Filters */}
                        <div className="flex gap-2 text-sm font-medium">
                            <Link
                                href="/"
                                className={`px-4 py-2 rounded-full transition-colors ${!category || category === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'}`}
                            >
                                すべて
                            </Link>
                            <Link
                                href="/?category=tennis"
                                className={`px-4 py-2 rounded-full transition-colors ${category === 'tennis' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'}`}
                            >
                                テニス 🎾
                            </Link>
                            <Link
                                href="/?category=futsal"
                                className={`px-4 py-2 rounded-full transition-colors ${category === 'futsal' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'}`}
                            >
                                フットサル ⚽
                            </Link>
                        </div>
                    </div>

                    {!typedEvents || typedEvents.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 text-center">
                            <div className="text-4xl mb-4">😢</div>
                            <p className="text-gray-500 font-medium">現在募集中のイベントはありません</p>
                            <p className="text-gray-400 text-sm mt-2">条件を変更して再度お試しください</p>
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
                                        {/* Mock Image Logic based on category if no real image */}
                                        <div className={`absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br ${event.category === 'futsal' ? 'from-green-50 to-emerald-100' : event.category === 'tennis' ? 'from-orange-50 to-amber-100' : 'from-indigo-50 to-purple-50'}`}>
                                            {event.category === 'futsal' ? '⚽' : event.category === 'tennis' ? '🎾' : '🗓️'}
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
    } catch (e: any) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 max-w-lg">
                    <h2 className="text-red-700 font-bold text-lg mb-2">エラーが発生しました</h2>
                    <p className="text-red-600 font-mono text-sm break-all">
                        {e.message || JSON.stringify(e)}
                    </p>
                </div>
            </div>
        )
    }
}
