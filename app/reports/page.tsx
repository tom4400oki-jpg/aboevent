import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export const revalidate = 60

export default async function ReportsPage() {
    const supabase = await createClient()
    const { data: reports } = await supabase
        .from('event_reports')
        .select(`
            id,
            title,
            content,
            created_at,
            events (title),
            report_images (image_url)
        `)
        .order('created_at', { ascending: false })

    return (
        <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                    開催レポート
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    ファニスポでの活動の様子をお届けします。イベントの雰囲気を感じてみてください！
                </p>
                <div className="mt-6 flex justify-center">
                    <div className="h-1.5 w-20 bg-indigo-600 rounded-full"></div>
                </div>
            </div>

            <div className="grid gap-12">
                {reports?.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <span className="text-4xl block mb-4">📄</span>
                        <p className="text-gray-500 font-medium">まだレポートが公開されていません</p>
                    </div>
                ) : (
                    reports?.map((report) => (
                        <article key={report.id} className="group grid md:grid-cols-5 gap-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all">
                            {/* Thumbnail */}
                            <div className="md:col-span-2 relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                                {report.report_images && report.report_images.length > 0 ? (
                                    <img
                                        src={report.report_images[0].image_url}
                                        alt={report.title}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300 italic text-sm">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                                        REPORT
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="md:col-span-3 flex flex-col justify-center space-y-4">
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                                    <time dateTime={report.created_at}>
                                        {format(new Date(report.created_at), 'yyyy.MM.dd', { locale: ja })}
                                    </time>
                                    {report.events && (
                                        <>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="text-indigo-600 uppercase tracking-wider">{report.events.title}</span>
                                        </>
                                    )}
                                </div>

                                <h2 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                    <Link href={`/reports/${report.id}`}>
                                        {report.title}
                                    </Link>
                                </h2>

                                <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                                    {report.content}
                                </p>

                                <div className="pt-2">
                                    <Link
                                        href={`/reports/${report.id}`}
                                        className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-700 transition-all group/btn"
                                    >
                                        詳しく見る
                                        <span className="inline-block transition-transform group-hover/btn:translate-x-1">→</span>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>

            <div className="mt-16 text-center">
                <Link href="/" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                    イベント一覧へ戻る
                </Link>
            </div>
        </main>
    )
}
