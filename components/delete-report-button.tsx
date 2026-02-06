'use client'

import { useTransition } from 'react'
import { deleteReport } from '@/app/admin/actions'

interface DeleteReportButtonProps {
    reportId: string
}

export default function DeleteReportButton({ reportId }: DeleteReportButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        if (!confirm('このレポートを削除してもよろしいですか？（写真はストレージからも削除されます）')) {
            return
        }

        startTransition(async () => {
            try {
                await deleteReport(reportId)
            } catch (err: any) {
                alert('削除に失敗しました: ' + err.message)
            }
        })
    }

    return (
        <div className="flex flex-col items-center gap-4 bg-red-50 p-6 rounded-2xl border border-red-100">
            <div className="text-center">
                <h3 className="text-red-800 font-bold">レポートを削除する</h3>
                <p className="text-xs text-red-600 mt-1">この操作は取り消せません</p>
            </div>
            <button
                onClick={handleDelete}
                disabled={isPending}
                className="bg-red-600 text-white font-bold py-2.5 px-8 rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-100 disabled:opacity-50"
            >
                {isPending ? '削除中...' : 'レポートを削除する'}
            </button>
        </div>
    )
}
