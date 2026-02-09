import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

// サイトのベースURL
const BASE_URL = 'https://funny-spo.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()

    // 全イベントを取得
    const { data: events } = await supabase
        .from('events')
        .select('id, updated_at')
        .order('created_at', { ascending: false })

    // 静的ページ
    const staticRoutes = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${BASE_URL}/reports`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        // 必要に応じて他の静的ページを追加
        // { url: `${BASE_URL}/about`, ... },
    ]

    // 動的ページ（イベント詳細）
    const eventRoutes = (events || []).map((event) => ({
        url: `${BASE_URL}/events/${event.id}`,
        lastModified: new Date(event.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...staticRoutes, ...eventRoutes]
}
