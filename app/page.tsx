import Link from 'next/link'
import { Suspense } from 'react'
import EventList from '@/components/event-list'

export const revalidate = 60

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>
}) {
    // Only await the search params to determine current filter state for UI
    const { category } = await searchParams

    return (
        <main className="space-y-8">
            {/* Hero Section */}
            <section className="relative rounded-3xl bg-indigo-900 overflow-hidden shadow-2xl">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80"
                        alt="Sports background"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/80"></div>
                </div>

                <div className="relative z-10 px-6 py-10 text-center sm:px-12 md:py-14">
                    <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6 drop-shadow-lg">
                        新しい<span className="text-orange-400">体験</span>を、<br className="sm:hidden" />
                        ここから始めよう
                    </h2>
                    <p className="mx-auto max-w-2xl text-indigo-100 text-lg sm:text-xl mb-6 leading-relaxed font-medium">
                        テニス、フットサル、そして新しい仲間。<br className="hidden sm:inline" />
                        あなたの日常に「熱狂」と「笑顔」をプラスします。
                    </p>
                </div>
            </section>

            <div className="space-y-6" id="events">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">募集中イベント</h2>

                    {/* Filters */}
                    <div className="flex gap-2 text-sm font-medium overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
                        <Link
                            href="/"
                            scroll={false}
                            className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${!category || category === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'}`}
                        >
                            すべて
                        </Link>
                        <Link
                            href="/?category=tennis"
                            scroll={false}
                            className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${category === 'tennis' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'}`}
                        >
                            テニス 🎾
                        </Link>
                        <Link
                            href="/?category=futsal"
                            scroll={false}
                            className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${category === 'futsal' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'}`}
                        >
                            フットサル ⚽
                        </Link>
                        <Link
                            href="/?category=volleyball"
                            scroll={false}
                            className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap ${category === 'volleyball' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'}`}
                        >
                            バレー 🏐
                        </Link>
                    </div>
                </div>

                <Suspense
                    key={category}
                    fallback={
                        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                                    <div className="mb-3 aspect-[16/9] w-full rounded bg-gray-100 animate-pulse"></div>
                                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse mb-2"></div>
                                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    }
                >
                    <EventList category={category} />
                </Suspense>
            </div>
        </main>
    )
}
