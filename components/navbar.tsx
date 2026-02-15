import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import UserMenu from '@/components/user-menu'
import AdminSwitcher from '@/components/admin-switcher'
import { getEffectiveUser, isViewAsUser, getEffectiveRole } from '@/utils/admin'

export default async function Navbar() {
    const supabase = await createClient()
    const user = await getEffectiveUser()

    // ログイン中のユーザー情報を取得
    const { data: profile } = user ? await supabase
        .from('profiles')
        .select('role, avatar_url')
        .eq('id', user.id)
        .single() : { data: null }

    const role = (profile?.role as 'admin' | 'moderator' | 'user' | 'lead' | 'member') || 'user'
    const avatarUrl = profile?.avatar_url
    const isPreview = await isViewAsUser()

    // プレビューモード（ユーザーとして表示）の場合はロールを'user'として扱う
    // プレビューモード（ユーザーとして表示）の場合はロールを'user'として扱う
    const effectiveRole = isPreview && (role === 'admin' || role === 'moderator') ? 'user' : role

    // メッセージのリンク先を決定
    // 管理者・副管理者で、かつプレビューモードでない場合は管理者用一覧へ
    const messageLink = (role === 'admin' || role === 'moderator') && !isPreview
        ? '/admin/messages'
        : '/messages'


    // ログイン中のユーザーの未読メッセージ数を取得
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
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
            {/* デスクトップ: 1行レイアウト */}
            <div className="hidden sm:flex mx-auto h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-16 w-[280px] overflow-hidden relative">
                        <Image
                            src="/logo.png"
                            alt="Funny-Spo - 横浜・戸塚の社会人スポーツサークル"
                            fill
                            className="object-cover object-center"
                            priority
                        />
                    </div>
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">
                        イベント
                    </Link>
                    <Link href="/reports" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">
                        ブログ
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {(role === 'admin' || role === 'moderator' || isPreview) && (
                                <AdminSwitcher initialIsPreview={isPreview} />
                            )}
                            <Link
                                href={messageLink}
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
                            <UserMenu email={user.email} role={effectiveRole} avatarUrl={avatarUrl} />
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

            {/* モバイル: 2段レイアウト */}
            <div className="sm:hidden">
                {/* 上段: ロゴ + ログイン/ユーザーメニュー */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                    <Link href="/" className="flex items-center">
                        <div className="h-12 w-[200px] overflow-hidden relative">
                            <Image
                                src="/logo.png"
                                alt="Funny-Spo"
                                fill
                                className="object-cover object-center"
                                priority
                            />
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                {(role === 'admin' || role === 'moderator' || isPreview) && (
                                    <AdminSwitcher initialIsPreview={isPreview} />
                                )}
                                <Link
                                    href={messageLink}
                                    className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                                    aria-label="メッセージ"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                    )}
                                </Link>
                                <UserMenu email={user.email} role={effectiveRole} avatarUrl={avatarUrl} />
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                            >
                                ログイン
                            </Link>
                        )}
                    </div>
                </div>

                {/* 下段: メニュー */}
                <div className="flex items-center justify-center gap-8 px-4 py-2 bg-gray-50/50">
                    <Link href="/" className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors">
                        イベント
                    </Link>
                    <Link href="/reports" className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors">
                        ブログ
                    </Link>
                </div>
            </div>
        </nav>
    )
}

