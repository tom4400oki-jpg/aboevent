import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ReferralTracker from '@/components/referral-tracker'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
    themeColor: '#4f46e5',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

export const metadata: Metadata = {
    metadataBase: new URL('https://funny-spo.netlify.app'),
    title: {
        default: 'Funny-Spo | 横浜・戸塚の「大人の放課後」 20・30代のゆるスポーツ＆遊び場',
        template: '%s | Funny-Spo 横浜のゆるスポーツコミュニティ',
    },
    description:
        '週末、スマホを見て終わっていませんか？Funny-Spo（ファニスポ）は、横浜・神奈川で活動する20代・30代のための「大人の放課後」です。テニス・フットサル・BARイベントを通じて、学生時代の「あの熱狂」と「利害関係のない仲間」に出会えます。運動が苦手でも大丈夫、初心者・1人参加大歓迎。運動不足も孤独も、ここで笑い飛ばそう。',
    keywords: [
        '横浜',
        '戸塚',
        '社会人サークル',
        '20代',
        '30代',
        '大人の放課後',
        '友達作り',
        'ゆるスポーツ',
        'サードプレイス',
        'テニス',
        'フットサル',
        'イベント',
    ],
    authors: [{ name: 'Funny-Spo 運営事務局' }],
    creator: 'Funny-Spo',
    publisher: 'Funny-Spo',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    icons: {
        icon: '/icon.png',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'Funny-Spo | 横浜・戸塚の「大人の放課後」',
        description: '週末、スマホを見て終わっていませんか？20代・30代のための「世界一ゆるい」スポーツ遊び場。テニス・フットサルで新しい仲間と出会おう。',
        url: 'https://funny-spo.netlify.app',
        siteName: 'Funny-Spo',
        locale: 'ja_JP',
        type: 'website',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Funny-Spo 大人の放課後',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Funny-Spo | 横浜・戸塚の「大人の放課後」',
        description: '運動が苦手でも大丈夫！20代・30代が集まる横浜のゆるスポーツコミュニティ。',
        images: ['/og-image.png'],
    },
    alternates: {
        canonical: '/',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'HHrQaKG5M1YlkTiB6U_T1AYJsdcdeCVlNf7ZWC_sYMA',
    },
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Funny-Spo',
        url: 'https://funny-spo.netlify.app',
    }

    return (
        <html lang="ja">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                {GA_MEASUREMENT_ID && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${GA_MEASUREMENT_ID}');
                            `}
                        </Script>
                    </>
                )}
            </head>
            <body className={`${inter.className} min-h-screen flex flex-col`}>
                <ReferralTracker />
                <Navbar />
                <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
                <Footer />
            </body>
        </html>
    )
}


