import { canManageEvents } from '@/utils/admin'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatEventDate, formatEventTimeRange } from '@/utils/date'

export const dynamic = 'force-dynamic'

export default async function EventBookingsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const hasAccess = await canManageEvents()

    if (!hasAccess) {
        redirect('/')
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // イベント情報を取得
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, title, start_at, end_at, location, category, image_url')
        .eq('id', id)
        .single()

    if (eventError || !event) {
        notFound()
    }

    // 管理者クライアントで予約一覧を取得 (RLSバイパス)
    const { data: bookings } = await adminClient
        .from('bookings')
        .select(`
            id,
            created_at,
            transportation,
            pickup_needed,
            user_id
        `)
        .eq('event_id', id)
        .order('created_at', { ascending: true })

    // ユーザー情報を取得
    const userIds = (bookings || []).map((b: any) => b.user_id)
    let profiles: any[] = []
    if (userIds.length > 0) {
        const { data } = await adminClient
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .in('id', userIds)
        profiles = data || []
    }

    // プロフィール情報をマップ化
    const profileMap = new Map(profiles.map((p: any) => [p.id, p]))

    const transportationLabel = (t: string | null) => {
        switch (t) {
            case 'car': return '車'
            case 'train': return '電車・バス'
            case 'other': return 'その他'
            default: return '-'
        }
    }

    const categoryLabel = (c: string | null) => {
        switch (c) {
            case 'futsal': return 'フットサル'
            case 'tennis': return 'テニス'
            case 'volleyball': return 'バレー'
            default: return 'その他'
        }
    }

    return (
        <main className="mx-auto max-w-4xl space-y-6 py-8 px-4 sm:px-6 lg:px-8">
            {/* 戻るリンク */}
            <Link
                href={`/events/${id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
            >
                ← イベント詳細に戻る
            </Link>

            {/* イベント情報ヘッダー */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-5">
                    {event.image_url ? (
                        <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-2xl">
                            {categoryLabel(event.category) === 'テニス' ? '🎾' : categoryLabel(event.category) === 'フットサル' ? '⚽' : categoryLabel(event.category) === 'バレー' ? '🏐' : '🗓️'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 truncate">{event.title}</h1>
                        <div className="text-sm text-gray-500 mt-1">
                            {formatEventDate(event.start_at)} {formatEventTimeRange(event.start_at, event.end_at)} / {event.location}
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 border border-indigo-100">
                            {bookings?.length || 0} 名
                        </span>
                    </div>
                </div>
            </div>

            {/* 予約者一覧 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">予約者一覧</h2>
                </div>

                {!bookings || bookings.length === 0 ? (
                    <div className="text-center p-12">
                        <div className="text-4xl mb-3">📭</div>
                        <p className="text-gray-500 font-medium">まだ予約者はいません</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">名前</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">メール</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">来場手段</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">送迎</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">予約日</th>
                                    <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {bookings.map((booking: any, index: number) => {
                                    const profile = profileMap.get(booking.user_id)
                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-400 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    {profile?.avatar_url ? (
                                                        <img src={profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                                            {(profile?.full_name || '?')[0]}
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {profile?.full_name || '(未設定)'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {profile?.email || '-'}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">
                                                {transportationLabel(booking.transportation)}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm">
                                                {booking.pickup_needed ? (
                                                    <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700 border border-orange-100">
                                                        希望あり
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(booking.created_at).toLocaleDateString('ja-JP', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-right text-sm">
                                                <Link
                                                    href={`/admin/messages/${booking.user_id}`}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors text-xs font-bold"
                                                >
                                                    メッセージ
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 管理リンク */}
            <div className="flex gap-3">
                <Link
                    href={`/admin/events/${id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 border border-indigo-100 transition-colors"
                >
                    イベントを編集
                </Link>
                <Link
                    href={`/events/${id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                    公開ページを見る
                </Link>
            </div>
        </main>
    )
}
