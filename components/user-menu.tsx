'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

interface UserMenuProps {
    email?: string
    role: 'admin' | 'moderator' | 'user'
}

export default function UserMenu({ email, role }: UserMenuProps) {
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
                className="flex items-center justify-center h-10 w-10 number-full rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-indigo-600 transition-colors"
                aria-label="ユーザーメニュー"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 z-50 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 truncate">ログイン中</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{email}</p>
                        {role !== 'user' && (
                            <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                {role === 'admin' ? '管理者' : '副管理者'}
                            </span>
                        )}
                    </div>

                    <div className="py-1">
                        <Link
                            href="/mypage"
                            className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="mr-3 text-gray-400 group-hover:text-indigo-500">⚙️</span>
                            マイページ
                        </Link>

                        <Link
                            href="/bookings"
                            className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="mr-3 text-gray-400 group-hover:text-indigo-500">📅</span>
                            予約一覧
                        </Link>

                        {/* Admin/Moderator Menu */}
                        {(role === 'admin' || role === 'moderator') && (
                            <>
                                <div className="border-t border-gray-100 my-1"></div>
                                <div className="px-4 py-1 text-xs font-bold text-gray-400">管理者メニュー</div>
                                <Link
                                    href="/admin/events/new"
                                    className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="mr-3 text-orange-400 group-hover:text-orange-500">➕</span>
                                    イベント作成
                                </Link>

                                {/* User List - ADMIN ONLY */}
                                {role === 'admin' && (
                                    <Link
                                        href="/admin/users"
                                        className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="mr-3 text-orange-400 group-hover:text-orange-500">👥</span>
                                        ユーザー一覧
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50/50 py-1">
                        <form action={signOut} className="w-full">
                            <button
                                type="submit"
                                className="group flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <span className="mr-3 text-red-400 group-hover:text-red-500">🚪</span>
                                ログアウト
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
