'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

interface UserMenuProps {
    email: string
}

export default function UserMenu({ email }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-95"
            >
                <span>メニュー</span>
                <svg className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 z-50">
                    <div className="py-2">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 mb-1">
                            {email}
                        </div>

                        <Link
                            href="/messages"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-bold"
                            onClick={() => setIsOpen(false)}
                        >
                            💬 メッセージ
                        </Link>

                        <Link
                            href="/bookings"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-bold"
                            onClick={() => setIsOpen(false)}
                        >
                            📅 予約一覧
                        </Link>

                        <Link
                            href="/mypage"
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-bold"
                            onClick={() => setIsOpen(false)}
                        >
                            ⚙️ マイページ
                        </Link>

                        <div className="border-t border-gray-100 mt-1 pt-1">
                            <form action={signOut}>
                                <button
                                    type="submit"
                                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold"
                                >
                                    🚪 ログアウト
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
