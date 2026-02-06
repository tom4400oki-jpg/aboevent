'use client'

import { useState, useTransition } from 'react'
import { deleteEvent } from '@/app/admin/actions'

interface DeleteEventButtonProps {
    eventId: string
    className?: string
}

export default function DeleteEventButton({ eventId, className = "" }: DeleteEventButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteEvent(eventId)
            } catch (err: any) {
                alert(err.message || '削除に失敗しました')
            }
        })
    }

    if (showConfirm) {
        return (
            <div className={`flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 ${className}`}>
                <span className="text-sm text-red-700 font-bold">このイベントを削除しますか？</span>
                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {isPending ? '削除中...' : 'はい、削除します'}
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="px-4 py-2 text-gray-500 text-sm font-bold hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        )
    }

    return (
        <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className={`px-6 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold transition-all ${className}`}
        >
            イベントを削除する
        </button>
    )
}
