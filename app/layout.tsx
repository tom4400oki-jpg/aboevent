import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'KPIイベント - テニス・フットサル交流会',
    description: '東戸塚で開催されるテニス・フットサルのイベントサイトです。初心者から上級者まで、みんなで楽しく汗を流しましょう！',
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
