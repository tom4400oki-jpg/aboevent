'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { bookEvent } from './actions'

interface ReserveButtonProps {
    eventId: string
    loggedIn: boolean
    isBooked: boolean
}

export default function ReserveButton({ eventId, loggedIn, isBooked }: ReserveButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleReserve = () => {
        startTransition(async () => {
            setError(null)
            const res = await bookEvent(eventId)
            if (res.error) {
                setError(res.error)
            }
        })
    }

    // Shared classes for consistency
    const buttonClasses = "flex items-center justify-center w-full rounded-lg py-4 font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"

    if (!loggedIn) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-8 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="mx-auto max-w-lg">
                    <Link
                        href="/login"
                        className={`${buttonClasses} bg-gray-800 hover:bg-gray-700 shadow-gray-200`}
                    >
                        ログインして予約する
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-8 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="mx-auto max-w-lg space-y-2">
                {error && (
                    <p className="text-center text-sm text-red-600">{error}</p>
                )}

                <button
                    onClick={handleReserve}
                    disabled={isBooked || isPending}
                    className={`${buttonClasses} ${isBooked
                            ? 'bg-green-600 shadow-green-200'
                            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200'
                        }`}
                >
                    {isBooked
                        ? '予約済み'
                        : isPending
                            ? '処理中...'
                            : '予約する'}
                </button>
            </div>
        </div>
    )
}
