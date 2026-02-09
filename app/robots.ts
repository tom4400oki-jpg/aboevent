import { MetadataRoute } from 'next'

// サイトのベースURL
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://funny-spo.netlify.app'

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
