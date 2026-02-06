import { createClient } from '@/utils/supabase/server'
import { canManageEvents } from '@/utils/admin'
import { redirect, notFound } from 'next/navigation'
import { updateReport } from '../../../actions'
import ReportImageUpload from '@/components/report-image-upload'
import DeleteReportButton from '@/components/delete-report-button'
import Link from 'next/link'

export default async function EditReportPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const hasAccess = await canManageEvents()
    if (!hasAccess) redirect('/')

    const supabase = await createClient()

    // 1. Fetch Report
    const { data: report } = await supabase
        .from('event_reports')
        .select(`
            *,
            report_images (image_url)
        `)
        .eq('id', id)
        .single()

    if (!report) notFound()

    // 2. Fetch Events for dropdown
    const { data: events } = await supabase
        .from('events')
        .select('id, title, start_at')
        .order('start_at', { ascending: false })
        .limit(20)

    const initialImages = report.report_images?.map((img: any) => img.image_url) || []

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">レポートの編集</h1>
                    <p className="text-sm text-gray-500 mt-1">公開中の内容を更新します</p>
                </div>
                <Link href={`/reports/${id}`} className="text-xs font-bold text-indigo-600 hover:underline">
                    公開ページを確認
                </Link>
            </div>

            <form action={updateReport} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <input type="hidden" name="id" value={report.id} />

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">レポートタイトル</label>
                    <input
                        type="text"
                        name="title"
                        required
                        defaultValue={report.title}
                        className="w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">内容</label>
                    <textarea
                        name="content"
                        required
                        rows={10}
                        defaultValue={report.content}
                        className="w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">関連するイベント (任意)</label>
                    <select
                        name="event_id"
                        defaultValue={report.event_id || ''}
                        className="w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                        <option value="">関連付けなし</option>
                        {events?.map(event => (
                            <option key={event.id} value={event.id}>
                                {new Date(event.start_at).toLocaleDateString('ja-JP')} - {event.title}
                            </option>
                        ))}
                    </select>
                </div>

                <ReportImageUpload defaultImages={initialImages} />

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
                        更新を保存する
                    </button>
                </div>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-100">
                <DeleteReportButton reportId={report.id} />
            </div>
        </div>
    )
}
