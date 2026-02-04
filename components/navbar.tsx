import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const signOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-indigo-600">
                        AboEvent
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/mypage" className="text-sm text-gray-600 hidden sm:block hover:text-indigo-600 transition-colors">
                                {user.email} さん
                            </Link>
                            <form action={signOut}>
                                <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
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
