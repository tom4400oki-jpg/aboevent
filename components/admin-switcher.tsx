'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const VIEW_AS_USER_COOKIE = 'view_as_user'

export default function AdminSwitcher({ initialIsPreview }: { initialIsPreview: boolean }) {
    const router = useRouter()
    const [isPerview, setIsPreview] = useState(initialIsPreview)

    useEffect(() => {
        setIsPreview(initialIsPreview)
    }, [initialIsPreview])

    const toggleView = () => {
        const newValue = !isPerview
        // Cookieを設定 (有効期限: 1日)
        document.cookie = `${VIEW_AS_USER_COOKIE}=${newValue}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
        setIsPreview(newValue)

        // ページをリロードしてサーバーサイドの表示を更新
        router.refresh()
    }

    return (
        <button
            onClick={toggleView}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${isPerview
                ? 'bg-orange-500 text-white border-orange-600 shadow-orange-100'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
        >
            <span className="text-base">{isPerview ? '👀' : '🛠️'}</span>
            <span>{isPerview ? 'ユーザー表示中' : '管理者モード'}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isPerview ? 'bg-white/30' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isPerview ? 'right-0.5' : 'left-0.5 shadow-sm'}`} />
            </div>
        </button>
    )
}
