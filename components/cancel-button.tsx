'use client'

import { useState, useTransition } from 'react'
import { cancelBooking } from '@/app/events/[id]/actions'

interface CancelButtonProps {
    bookingId: string
    className?: string
}

export default function CancelButton({ bookingId, className = "" }: CancelButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)

    const handleCancel = () => {
        startTransition(async () => {
            const res = await cancelBooking(bookingId)
            if (res?.error) {
                alert(res.error)
            } else {
                setShowConfirm(false)
                // Optional: Force simpler router refresh if needed, but actions normally handle it
            }
        })
    }

    if (showConfirm) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-xs text-red-600 font-bold">本当にキャンセルしますか？</span>
                <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    {isPending ? '...' : 'はい'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="px-2 py-1 text-gray-500 text-xs hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className={`px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-all ${className}`}
        >
            キャンセル
        </button>
    )
}
