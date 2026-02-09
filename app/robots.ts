import { MetadataRoute } from 'next'

// サイトのベースURL
const BASE_URL = 'https://funny-spo.vercel.app'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/mypage/', '/api/'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    }
}
