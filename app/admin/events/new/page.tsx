import { canManageEvents } from '@/utils/admin'
import { redirect } from 'next/navigation'
import { createEvent } from '../../actions'
import ImageUpload from '@/components/image-upload'
import TimeSelect from '@/components/time-select'
import { createClient } from '@/utils/supabase/server'
import { formatToDateValue, formatToTimeValue } from '@/utils/date'
import EventLocationFields from '@/components/event-location-fields'

export default async function NewEventPage({
    searchParams
}: {
    searchParams: Promise<{ copyFrom?: string }>
}) {
    const hasAccess = await canManageEvents()

    if (!hasAccess) {
        redirect('/')
    }

    const { copyFrom } = await searchParams
    let initialData = null

    if (copyFrom) {
        const supabase = await createClient()
        const { data } = await supabase
            .from('events')
            .select('*')
            .eq('id', copyFrom)
            .single()
        initialData = data
    }

    const today = formatToDateValue(new Date().toISOString())

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">イベント作成 (管理者専用)</h1>

            <form action={createEvent} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">

                <ImageUpload name="image_url" defaultValue={initialData?.image_url || ''} />

                <div>
                    <label className="block text-sm font-bold text-gray-700">タイトル</label>
                    <input type="text" name="title" required defaultValue={initialData?.title || ''} className="mt-1 block w-full rounded-md border-gray-300 border p-2 w-full" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">日付</label>
                        <input type="date" name="event_date" required defaultValue={initialData ? formatToDateValue(initialData.start_at) : today} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">開始時間</label>
                        <TimeSelect name="start_time" required defaultValue={initialData ? formatToTimeValue(initialData.start_at) : '10:00'} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">終了時間</label>
                        <TimeSelect name="end_time" required defaultValue={initialData ? formatToTimeValue(initialData.end_at) : '12:00'} />
                    </div>
                </div>

                <EventLocationFields
                    initialLocation={initialData?.location || ''}
                    initialNearestStation={initialData?.nearest_station || ''}
                    initialLatitude={initialData?.latitude}
                    initialLongitude={initialData?.longitude}
                />

                <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">価格 (円)</label>
                        <input type="number" name="price" required defaultValue={initialData?.price || 1500} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                        <input
                            type="checkbox"
                            name="ask_transportation"
                            id="ask_transportation"
                            defaultChecked={initialData ? initialData.ask_transportation : true}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="ask_transportation" className="text-sm font-bold text-gray-700 cursor-pointer">
                            来場手段（送迎）を確認する
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">閲覧・参加可能な権限</label>
                    <select name="min_role" required defaultValue={initialData?.min_role || 'user'} className="mt-1 block w-full rounded-md border-gray-300 border p-2">
                        <option value="user">新規 (user) 以上</option>
                        <option value="lead">アム出し (lead) 以上</option>
                        <option value="member">メンバー (member) 以上</option>
                        <option value="moderator">副管理者 (moderator) 以上</option>
                        <option value="admin">管理者 (admin) のみ</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">指定した権限以上のユーザーのみがイベントを確認・申し込めるようになります。</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">カテゴリー</label>
                    <select name="category" required defaultValue={initialData?.category || 'futsal'} className="mt-1 block w-full rounded-md border-gray-300 border p-2">
                        <option value="futsal">フットサル ⚽</option>
                        <option value="tennis">テニス 🎾</option>
                        <option value="volleyball">バレー 🏐</option>
                        <option value="other">その他</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">アクセス・送迎詳細 (任意)</label>
                    <input
                        type="text"
                        name="transportation_info"
                        placeholder="例: 〇〇駅より送迎可 (※要相談)"
                        defaultValue={initialData?.transportation_info || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">詳細ページの「アクセス・送迎」欄にそのまま表示されます。</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">詳細</label>
                    <textarea name="description" rows={5} defaultValue={initialData?.description || ''} className="mt-1 block w-full rounded-md border-gray-300 border p-2"></textarea>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    {copyFrom ? 'コピーして新規作成' : 'イベントを作成する'}
                </button>
            </form>
        </div>
    )
}
