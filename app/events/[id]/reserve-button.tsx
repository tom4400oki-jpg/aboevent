'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { bookEvent } from './actions'

interface ReserveButtonProps {
    eventId: string
    loggedIn: boolean
    isBooked: boolean
    disabled?: boolean
    askTransportation?: boolean
}

export default function ReserveButton({ eventId, loggedIn, isBooked, disabled, askTransportation = true }: ReserveButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleFormSubmit = async (formData: FormData) => {
        // If transportation is not asked, set defaults
        if (!askTransportation) {
            formData.set('transportation', 'other')
            formData.set('pickup_needed', 'off')
        }

        startTransition(async () => {
            setError(null)
            const res = await bookEvent(formData)
            if (res?.error) {
                setError(res.error)
            } else {
                setIsModalOpen(false) // Close modal on success
            }
        })
    }

    // Shared classes for consistency
    const buttonClasses = "flex items-center justify-center w-full rounded-lg py-4 font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"

    // 予約済みの場合の表示 (変更なし)
    if (isBooked) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-8 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                <div className="mx-auto max-w-lg space-y-3">
                    <button
                        disabled
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-200 cursor-default opacity-100"
                    >
                        <span>✅</span> 予約完了
                    </button>

                    <div className="text-center">
                        <Link
                            href="/bookings"
                            className="text-xs text-gray-500 hover:text-indigo-600 underline"
                        >
                            予約の変更・キャンセルはこちら
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // ログイン状態に応じたボタン表示
    return (
        <>
            {/* Sticky Footer Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-8 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                <div className="mx-auto max-w-lg space-y-3">
                    {!loggedIn ? (
                        <Link
                            href={disabled ? "#" : "/login"}
                            className={`${buttonClasses} ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 shadow-gray-200'}`}
                            onClick={(e) => disabled && e.preventDefault()}
                        >
                            {disabled ? '受付終了しました' : 'ログインして予約する'}
                        </Link>
                    ) : (
                        <button
                            onClick={() => {
                                if (!disabled) {
                                    setIsModalOpen(true)
                                }
                            }}
                            disabled={disabled}
                            className={`${buttonClasses} ${disabled ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200'}`}
                        >
                            {disabled ? '受付終了しました' : '予約へ進む'}
                        </button>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50 sticky top-0 backdrop-blur-md z-10">
                            <h3 className="text-lg font-bold text-gray-900">
                                予約情報の入力
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            <form action={handleFormSubmit} className="space-y-6">
                                <input type="hidden" name="eventId" value={eventId} />

                                {askTransportation && (
                                    <>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">
                                                当日の来場手段 <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-2">
                                                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                                                    <input type="radio" name="transportation" value="car" required className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                                    <span className="ml-3 block text-sm font-medium text-gray-900">車 (自家用車など)</span>
                                                </label>
                                                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                                                    <input type="radio" name="transportation" value="train" required className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                                    <span className="ml-3 block text-sm font-medium text-gray-900">電車・バス</span>
                                                </label>
                                                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                                                    <input type="radio" name="transportation" value="other" required className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                                    <span className="ml-3 block text-sm font-medium text-gray-900">その他 (徒歩・自転車など)</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50">
                                                <div className="flex items-center h-5">
                                                    <input type="checkbox" name="pickup_needed" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <span className="font-bold text-gray-900">送迎を希望する</span>
                                                    <p className="text-gray-500 mt-1 text-xs">駅などからの送迎が必要な場合はチェックを入れてください。</p>
                                                </div>
                                            </label>
                                        </div>
                                    </>
                                )}

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                    >
                                        {isPending ? '予約処理中...' : '上記の内容で予約する'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
