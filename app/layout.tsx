import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Funny-Spo | 「笑って痩せる」社会人サークル',
    description: 'Funny-Spo（ファニスポ）は、運動不足の社会人が集まる「世界一ゆるい」スポーツサークルです。テニスやフットサルを遊び感覚で楽しみながら、ダイエットと友達作りを叶えます。初心者・お一人様大歓迎！',
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
