import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import ReportImageGallery from '@/components/report-image-gallery'
import { canManageEvents } from '@/utils/admin'

export const revalidate = 3600 // Cache for 1 hour

export default async function ReportDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: report } = await supabase
        .from('event_reports')
        .select(`
            *,
            events (id, title),
            report_images (image_url)
        `)
        .eq('id', id)
        .single()

    if (!report) notFound()

    const canEdit = await canManageEvents()

    // Fetch other recent reports
    const { data: otherReports } = await supabase
        .from('event_reports')
        .select(`
            id,
            title,
            created_at,
            report_images (image_url)
        `)
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(3)

    return (
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Main Content */}
                <div className="flex-1 lg:max-w-4xl">
                    {/* Header */}
                    <header className="mb-12 text-center lg:text-left">
                        <div className="flex flex-col items-center lg:items-start gap-4 mb-6">
                            <div className="flex items-center justify-center lg:justify-start gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <time dateTime={report.created_at}>
                                    {format(new Date(report.created_at), 'yyyy年MM月dd日', { locale: ja })}
                                </time>
                                {report.events && (
                                    <>
                                        <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full"></span>
                                        <Link href={`/events/${report.events.id}`} className="text-indigo-600 hover:underline">
                                            {report.events.title}
                                        </Link>
                                    </>
                                )}
                            </div>

                            {canEdit && (
                                <Link
                                    href={`/admin/reports/${id}/edit`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-xs font-bold hover:bg-orange-100 transition-all shadow-sm"
                                >
                                    <span>✏️</span>
                                    この記事を編集する
                                </Link>
                            )}
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 sm:text-4xl lg:text-5xl leading-tight mb-8">
                            {report.title}
                        </h1>
                        <div className="h-1.5 w-24 bg-indigo-600 lg:mx-0 mx-auto rounded-full"></div>
                    </header>

                    {/* Images Gallery */}
                    <ReportImageGallery images={report.report_images || []} title={report.title} />

                    {/* Content */}
                    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm mb-12">
                        <div className="prose prose-indigo prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                            {report.content}
                        </div>
                    </div>

                    {/* Footer Navigation (Mobile centric) */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12 border-t border-gray-100">
                        <Link
                            href="/reports"
                            className="text-gray-500 hover:text-indigo-600 font-bold transition-all flex items-center gap-2 group"
                        >
                            <span className="transition-transform group-hover:-translate-x-1">←</span> ブログ一覧へ
                        </Link>

                        {report.events && (
                            <Link
                                href={`/events/${report.events.id}`}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                            >
                                このイベントの詳細を見る
                            </Link>
                        )}
                    </div>
                </div>

                {/* Sidebar - Other Reports */}
                <aside className="lg:w-80 space-y-8">
                    <div className="sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                            他のレポート
                        </h3>

                        <div className="space-y-6">
                            {otherReports?.map((other: any) => (
                                <Link
                                    key={other.id}
                                    href={`/reports/${other.id}`}
                                    className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all"
                                >
                                    {other.report_images?.[0] && (
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={other.report_images[0].image_url}
                                                alt={other.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <p className="text-xs text-gray-400 font-bold mb-1">
                                            {format(new Date(other.created_at), 'yyyy.MM.dd')}
                                        </p>
                                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                                            {other.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))}

                            <Link
                                href="/reports"
                                className="block w-full text-center py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 font-bold hover:border-indigo-200 hover:text-indigo-600 transition-all"
                            >
                                すべてのレポートを見る
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    )
}
