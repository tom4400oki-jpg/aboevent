import { createClient } from '@/utils/supabase/server'
import { canManageEvents } from '@/utils/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function AdminReportsPage() {
    const hasAccess = await canManageEvents()
    if (!hasAccess) redirect('/')

    const supabase = await createClient()
    const { data: reports } = await supabase
        .from('event_reports')
        .select(`
            id,
            title,
            created_at,
            events (title)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">イベントレポート管理</h1>
                    <p className="text-sm text-gray-500 mt-1">開催したイベントの写真や報告を公開します</p>
                </div>
                <Link
                    href="/admin/reports/new"
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                >
                    <span className="text-lg">✍️</span>
                    新規作成
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">作成日</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">レポートタイトル</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">関連イベント</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {reports?.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    まだレポートがありません
                                </td>
                            </tr>
                        ) : (
                            reports?.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(report.created_at), 'yyyy/MM/dd', { locale: ja })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {report.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            {report.events?.[0]?.title || 'なし'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/reports/${report.id}/edit`}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-900 py-1 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
                                        >
                                            編集
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex justify-center">
                <Link href="/admin" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors">
                    <span>←</span> 管理画面トップへ戻る
                </Link>
            </div>
        </div>
    )
}
