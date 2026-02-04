import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

interface Event {
    id: string
    title: string
    start_at: string
    location: string
    price: number | null
    category?: string
}

export default async function EventList({ category }: { category?: string }) {
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

    if (!typedEvents || typedEvents.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 text-center">
                <div className="text-4xl mb-4">😢</div>
                <p className="text-gray-500 font-medium">現在募集中のイベントはありません</p>
                <p className="text-gray-400 text-sm mt-2">条件を変更して再度お試しください</p>
            </div>
        )
    }

    return (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {typedEvents.map((event) => (
                <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                    {/* Card Image Placeholder */}
                    <div className="aspect-[16/9] w-full bg-gray-100 relative overflow-hidden">
                        {/* Mock Image Logic based on category if no real image */}
                        <div className={`absolute inset-0 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br ${event.category === 'futsal' ? 'from-green-50 to-emerald-100' : event.category === 'tennis' ? 'from-orange-50 to-amber-100' : 'from-indigo-50 to-purple-50'}`}>
                            {event.category === 'futsal' ? '⚽' : event.category === 'tennis' ? '🎾' : '🗓️'}
                        </div>
                        <div className="absolute top-1 right-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-indigo-600 shadow-sm backdrop-blur-sm">
                            募集中
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col p-3">
                        <div className="mb-1 text-xs font-semibold text-indigo-600">
                            {new Date(event.start_at).toLocaleDateString('ja-JP', {
                                month: 'numeric',
                                day: 'numeric',
                                weekday: 'short',
                                hour: 'numeric',
                                minute: '2-digit'
                            })}
                        </div>
                        <h3 className="mb-2 text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {event.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-1 min-w-0">
                                <span>📍</span>
                                <span className="truncate max-w-[80px]">{event.location}</span>
                            </div>
                            <div className="font-bold text-gray-900 whitespace-nowrap pl-1">
                                ¥{event.price?.toLocaleString() ?? 0}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
