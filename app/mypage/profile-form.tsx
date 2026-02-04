'use client'

import { useState } from 'react'
import { updateProfile } from './actions'

export default function ProfileForm({
    initialFullName,
    email
}: {
    initialFullName: string | null
    email: string
}) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setMessage(null)

        const result = await updateProfile(formData)

        if (result.error) {
            setMessage({ text: result.error, type: 'error' })
        } else if (result.success) {
            setMessage({ text: result.message || 'Updated', type: 'success' })
        }

        setLoading(false)
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    メールアドレス
                </label>
                <div className="mt-1">
                    <input
                        type="email"
                        name="email"
                        id="email"
                        disabled
                        value={email}
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-4 py-2 border text-gray-500 cursor-not-allowed"
                    />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                    メールアドレスは変更できません。
                </p>
            </div>

            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    表示名 (フルネーム)
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        defaultValue={initialFullName || ''}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                        placeholder="山田 太郎"
                    />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                    イベント予約時や他のユーザーに表示される名前です。
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {loading ? '保存中...' : 'プロフィールを更新'}
                </button>
            </div>
        </form>
    )
}
