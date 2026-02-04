import { canManageEvents } from '@/utils/admin'
import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { updateEvent } from '../../../actions'

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

    // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toISOString().slice(0, 16)
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">イベント編集 (管理者専用)</h1>

            <form action={updateEvent} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <input type="hidden" name="id" value={event.id} />

                <div>
                    <label className="block text-sm font-bold text-gray-700">タイトル</label>
                    <input type="text" name="title" required defaultValue={event.title} className="mt-1 block w-full rounded-md border-gray-300 border p-2 w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">開始日時</label>
                        <input type="datetime-local" name="start_at" required defaultValue={formatDateTime(event.start_at)} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">終了日時</label>
                        <input type="datetime-local" name="end_at" required defaultValue={formatDateTime(event.end_at)} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">場所</label>
                        <input type="text" name="location" required defaultValue={event.location} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">価格 (円)</label>
                        <input type="number" name="price" required defaultValue={event.price || 0} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">定員</label>
                        <input type="number" name="capacity" required defaultValue={event.capacity || 20} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">カテゴリー</label>
                        <select name="category" required defaultValue={event.category} className="mt-1 block w-full rounded-md border-gray-300 border p-2">
                            <option value="futsal">フットサル ⚽</option>
                            <option value="tennis">テニス 🎾</option>
                            <option value="volleyball">バレー 🏐</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">画像URL (任意)</label>
                    <input type="url" name="image_url" defaultValue={event.image_url || ''} className="mt-1 block w-full rounded-md border-gray-300 border p-2" placeholder="https://..." />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">詳細</label>
                    <textarea name="description" rows={5} defaultValue={event.description || ''} className="mt-1 block w-full rounded-md border-gray-300 border p-2"></textarea>
                </div>

                <div className="flex gap-4">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        更新する
                    </button>
                    <a href={`/events/${event.id}`} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">
                        キャンセル
                    </a>
                </div>
            </form>
        </div>
    )
}
