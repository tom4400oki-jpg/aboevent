import { canManageEvents } from '@/utils/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { updateEvent } from '../../../actions'
import { formatToDateValue, formatToTimeValue } from '@/utils/date'
import ImageUpload from '@/components/image-upload'
import DeleteEventButton from '@/components/delete-event-button'
import TimeSelect from '@/components/time-select'
import EventLocationFields from '@/components/event-location-fields'

export default async function EditEventPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const hasAccess = await canManageEvents()

    if (!hasAccess) {
        redirect('/')
    }

    const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !event) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">イベント編集 (管理者専用)</h1>

            <form action={updateEvent} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <input type="hidden" name="id" value={event.id} />

                <ImageUpload name="image_url" defaultValue={event.image_url || ''} />

                <div>
                    <label className="block text-sm font-bold text-gray-700">タイトル</label>
                    <input type="text" name="title" required defaultValue={event.title} className="mt-1 block w-full rounded-md border-gray-300 border p-2 w-full" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">日付</label>
                        <input type="date" name="event_date" required defaultValue={formatToDateValue(event.start_at)} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">開始時間</label>
                        <TimeSelect name="start_time" required defaultValue={formatToTimeValue(event.start_at)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">終了時間</label>
                        <TimeSelect name="end_time" required defaultValue={formatToTimeValue(event.end_at)} />
                    </div>
                </div>

                <EventLocationFields
                    initialLocation={event.location || ''}
                    initialNearestStation={event.nearest_station || ''}
                    initialLatitude={event.latitude}
                    initialLongitude={event.longitude}
                />

                <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">価格 (円)</label>
                        <input type="number" name="price" required defaultValue={event.price} className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm" />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                        <input
                            type="checkbox"
                            name="ask_transportation"
                            id="ask_transportation"
                            defaultChecked={event.ask_transportation}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="ask_transportation" className="text-sm font-bold text-gray-700 cursor-pointer">
                            来場手段（送迎）を確認する
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">定員</label>
                        <input type="number" name="capacity" required defaultValue={event.capacity || 20} className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">カテゴリー</label>
                        <select name="category" required defaultValue={event.category} className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm">
                            <option value="futsal">フットサル ⚽</option>
                            <option value="tennis">テニス 🎾</option>
                            <option value="volleyball">バレー 🏐</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">閲覧・参加可能な権限</label>
                    <select name="min_role" required defaultValue={event.min_role || 'user'} className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm">
                        <option value="user">新規 (user) 以上</option>
                        <option value="lead">アム出し (lead) 以上</option>
                        <option value="member">メンバー (member) 以上</option>
                        <option value="moderator">副管理者 (moderator) 以上</option>
                        <option value="admin">管理者 (admin) のみ</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">指定した権限以上のユーザーのみがイベントを確認・申し込めるようになります。</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">アクセス・送迎詳細 (任意)</label>
                    <input
                        type="text"
                        name="transportation_info"
                        placeholder="例: 〇〇駅より送迎可 (※要相談)"
                        defaultValue={event.transportation_info || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">詳細ページの「アクセス・送迎」欄にそのまま表示されます。</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">詳細</label>
                    <textarea name="description" rows={5} defaultValue={event.description || ''} className="mt-1 block w-full rounded-md border-gray-300 border p-2"></textarea>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button type="submit" className="flex-1 min-w-[150px] bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        更新する
                    </button>
                    <Link
                        href={`/admin/events/new?copyFrom=${event.id}`}
                        className="flex-1 min-w-[150px] bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors text-center"
                    >
                        コピーして新規作成
                    </Link>
                    <a href={`/events/${event.id}`} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">
                        キャンセル
                    </a>
                </div>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100">
                <DeleteEventButton eventId={event.id} className="w-full" />
            </div>
        </div>
    )
}
