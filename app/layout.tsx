import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: {
        default: 'Funny-Spo | 横浜・戸塚の「笑って痩せる」社会人スポーツサークル',
        template: '%s | Funny-Spo'
    },
    description: '横浜・戸塚・東戸塚・神奈川で活動中！Funny-Spo（ファニスポ）は、運動不足の社会人が集まる「世界一ゆるい」スポーツサークルです。テニス、フットサル、バレーボールを遊び感覚で楽しみながら、ダイエットと友達作りを叶えます。初心者・1人参加大歓迎！',
    keywords: ['横浜', '戸塚', '東戸塚', '神奈川', '社会人サークル', 'スポーツサークル', 'テニス', 'フットサル', 'バレーボール', 'ダイエット', '運動不足解消'],
    openGraph: {
        title: 'Funny-Spo | 横浜・戸塚の「笑って痩せる」社会人スポーツサークル',
        description: '初心者・お一人様大歓迎！横浜・戸塚を中心に活動する世界一ゆるい社会人スポーツサークルです。',
        url: 'https://funny-spo.vercel.app', // URLは仮ですが設定しておきます
        siteName: 'Funny-Spo',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80',
                width: 1200,
                height: 630,
            },
        ],
        locale: 'ja_JP',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Funny-Spo | 横浜・戸塚の「笑って痩せる」社会人スポーツサークル',
        description: '初心者・お一人様大歓迎！横浜・戸塚を中心に活動する世界一ゆるい社会人スポーツサークルです。',
        images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80'],
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
    return (
        <html lang="ja">
            <body className={`${inter.className} min-h-screen flex flex-col`}>
                <Navbar />
                <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    {children}
                </div>
                <Footer />
            </body>
        </html>
    )
}
