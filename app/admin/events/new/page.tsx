import { canManageEvents } from '@/utils/admin'
import { redirect } from 'next/navigation'
import { createEvent } from '../../actions'

export default async function NewEventPage() {
    const hasAccess = await canManageEvents()

    if (!hasAccess) {
        redirect('/')
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">イベント作成 (管理者専用)</h1>

            <form action={createEvent} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">

                <div>
                    <label className="block text-sm font-bold text-gray-700">タイトル</label>
                    <input type="text" name="title" required className="mt-1 block w-full rounded-md border-gray-300 border p-2 w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">開始日時</label>
                        <input type="datetime-local" name="start_at" required className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">終了日時</label>
                        <input type="datetime-local" name="end_at" required className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">場所</label>
                        <input type="text" name="location" required className="mt-1 block w-full rounded-md border-gray-300 border p-2" defaultValue="渋谷アディダスフットサルパーク" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">価格 (円)</label>
                        <input type="number" name="price" required className="mt-1 block w-full rounded-md border-gray-300 border p-2" defaultValue="1500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">定員</label>
                        <input type="number" name="capacity" required className="mt-1 block w-full rounded-md border-gray-300 border p-2" defaultValue="20" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">カテゴリー</label>
                        <select name="category" required className="mt-1 block w-full rounded-md border-gray-300 border p-2">
                            <option value="futsal">フットサル ⚽</option>
                            <option value="tennis">テニス 🎾</option>
                            <option value="volleyball">バレー 🏐</option>
                            <option value="other">その他</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">画像URL (任意)</label>
                    <input type="url" name="image_url" className="mt-1 block w-full rounded-md border-gray-300 border p-2" placeholder="https://..." />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">詳細</label>
                    <textarea name="description" rows={5} className="mt-1 block w-full rounded-md border-gray-300 border p-2"></textarea>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    イベントを作成する
                </button>
            </form>
        </div>
    )
}
