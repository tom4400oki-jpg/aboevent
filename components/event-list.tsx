import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { formatEventTimeRange, formatEventDate } from '@/utils/date'
import { getRole } from '@/utils/admin'

// 権限の階層定義（数値が大きいほど権限が高い）
const ROLE_LEVELS: Record<string, number> = {
    user: 1,
    lead: 2,
    member: 3,
    moderator: 4,
    admin: 5,
}

interface Event {
    id: string
    title: string
    start_at: string
    end_at: string
    location: string
    price: number | null
    category?: string
    image_url?: string | null
    min_role?: string
}

export default async function EventList({ category, previewRole }: { category?: string, previewRole?: string }) {
    const supabase = await createClient()
    const userRole = await getRole()

    // 表示に使用する権限（プレビューモードの場合はpreviewRole、それ以外は実際の権限）
    const effectiveRole = previewRole || userRole
    const effectiveRoleLevel = ROLE_LEVELS[effectiveRole] || 1

    let query = supabase
        .from('events')
        .select('id, title, start_at, end_at, location, price, category, image_url, min_role')
        .order('start_at', { ascending: true })

    if (category && category !== 'all') {
        query = query.eq('category', category)
    }

    const { data: events, error } = await query

    if (error) {
        throw new Error(`Database Error: ${error.message}`)
    }

    // 権限に基づいてイベントをフィルタリング
    const typedEvents = (events as unknown as Event[]).filter(event => {
        const eventMinRole = event.min_role || 'user'
        const eventMinLevel = ROLE_LEVELS[eventMinRole] || 1
        return effectiveRoleLevel >= eventMinLevel
    })

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
            {typedEvents.map((event) => {
                const isExpired = new Date(event.start_at) < new Date()

                return (
                    <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className={`group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-md ${isExpired ? 'opacity-75' : ''}`}
                    >
                        {/* Card Image */}
                        <div className="aspect-[16/9] w-full bg-gray-100 relative overflow-hidden">
                            {event.image_url ? (
                                <img
                                    src={event.image_url}
                                    alt={event.title}
                                    className={`absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ${isExpired ? 'grayscale-[0.5]' : ''}`}
                                />
                            ) : (
                                <div className={`absolute inset-0 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-500 bg-gradient-to-br ${event.category === 'futsal' ? 'from-green-50 to-emerald-100' : event.category === 'tennis' ? 'from-orange-50 to-amber-100' : 'from-indigo-50 to-purple-50'}`}>
                                    {event.category === 'futsal' ? '⚽' : event.category === 'tennis' ? '🎾' : '🗓️'}
                                </div>
                            )}
                            <div className={`absolute top-1 right-1 rounded-md px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm ${isExpired ? 'bg-gray-500/90 text-white' : 'bg-white/90 text-indigo-600'}`}>
                                {isExpired ? '受付終了' : '募集中'}
                            </div>
                            {/* 権限バッジ（管理者のみ表示） */}
                            {userRole === 'admin' && event.min_role && event.min_role !== 'user' && (
                                <div className="absolute top-1 left-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold bg-orange-500/90 text-white">
                                    {event.min_role === 'lead' ? 'アム出し以上' :
                                        event.min_role === 'member' ? 'メンバー以上' :
                                            event.min_role === 'moderator' ? '副管理者以上' :
                                                event.min_role === 'admin' ? '管理者のみ' : ''}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-1 flex-col p-3">
                            <div className="mb-1 text-xs font-semibold text-indigo-600">
                                <div>{formatEventDate(event.start_at)}</div>
                                <div>{formatEventTimeRange(event.start_at, event.end_at)}</div>
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
                )
            })}
        </div>
    )
}

