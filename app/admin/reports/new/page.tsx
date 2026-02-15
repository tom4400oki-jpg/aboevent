import { createClient } from '@/utils/supabase/server'
import { canManageEvents } from '@/utils/admin'
import { redirect } from 'next/navigation'
import { createReport } from '../../actions'
import ReportImageUpload from '@/components/report-image-upload'
import Link from 'next/link'

export default async function NewReportPage() {
    const hasAccess = await canManageEvents()
    if (!hasAccess) redirect('/')

    const supabase = await createClient()
    const { data: events } = await supabase
        .from('events')
        .select('id, title, start_at')
        .order('start_at', { ascending: false })
        .limit(20)

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">新規記事の作成</h1>
                <p className="text-sm text-gray-500 mt-1">日々の活動報告や、スポーツにまつわるコラムを投稿しましょう</p>
            </div>

            <form action={createReport} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">タイトル</label>
                    <input
                        type="text"
                        name="title"
                        required
                        placeholder="例: 今日も楽しくテニスができました！"
                        className="w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">内容</label>
                    <textarea
                        name="content"
                        required
                        rows={10}
                        placeholder="開催の様子や、伝えたいことを詳しく記入してください。作成した記事はサイトのブログコーナーに公開されます。"
                        className="w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">関連するイベント (任意)</label>
                    <select
                        name="event_id"
                        className="w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                        <option value="">関連付けなし（日常ブログ）</option>
                        {events?.map(event => (
                            <option key={event.id} value={event.id}>
                                {new Date(event.start_at).toLocaleDateString('ja-JP')} - {event.title}
                            </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-gray-400">※イベントを選択すると、そのイベントの詳細画面のギャラリーにこの記事の写真が表示されます。</p>
                </div>

                <ReportImageUpload />

                <div className="flex gap-4 pt-4 border-t border-gray-50">
                    <Link
                        href="/admin/reports"
                        className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold transition-all text-center"
                    >
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        className="flex-[2] bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
                    >
                        記事を公開する
                    </button>
                </div>
            </form>
        </div>
    )
}
