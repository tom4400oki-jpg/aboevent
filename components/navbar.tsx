import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/auth/actions'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch unread messages count if user is logged in
    let unreadCount = 0
    if (user) {
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('is_read', false)

        unreadCount = count || 0
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-4xl font-black tracking-tighter text-indigo-600 font-sans italic">
                        KPI PARKイベント
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-6 text-sm font-bold text-gray-700">
                            {/* Admin Link */}
                            {user.email === 'tom4400oki@gmail.com' && (
                                <Link href="/admin/events/new" className="text-orange-600 hover:text-orange-700 transition-colors border border-orange-200 bg-orange-50 px-3 py-2 rounded-full hidden sm:block">
                                    管理者
                                </Link>
                            )}

                            <Link href="/bookings" className="hover:text-indigo-600 transition-colors py-2">
                                予約一覧
                            </Link>

                            <Link href="/messages" className="hover:text-indigo-600 transition-colors py-2 relative flex items-center">
                                メッセージ
                                {unreadCount > 0 && (
                                    <span className="ml-1 flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                )}
                            </Link>

                            <Link href="/mypage" className="hover:text-indigo-600 transition-colors py-2">
                                マイページ
                            </Link>

                            <form action={signOut}>
                                <button className="text-gray-400 hover:text-red-500 transition-colors py-2 ml-2">
                                    ログアウト
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-md active:scale-95"
                        >
                            ログイン
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
