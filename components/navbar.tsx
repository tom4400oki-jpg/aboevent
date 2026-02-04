import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import UserMenu from '@/components/user-menu'
import { getRole } from '@/utils/admin'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const role = await getRole()

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
            <div className="mx-auto flex h-26 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-20 w-[280px] sm:w-[320px] overflow-hidden">
                        <img
                            src="/logo.png"
                            alt="Funny-Spo"
                            className="h-full w-full object-cover object-center"
                        />
                    </div>
                </Link>

                <div className="flex items-center gap-4 sm:gap-6">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3">
                                {/* Message Icon */}
                                <Link
                                    href="/messages"
                                    className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-indigo-600"
                                    aria-label="メッセージ"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>

                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                <UserMenu email={user.email} role={role} />
                            </div>
                        </>
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
