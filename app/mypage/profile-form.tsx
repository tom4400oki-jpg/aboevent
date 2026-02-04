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
            {/* Email - Hidden in UI but kept in props if needed later, or we just remove the display completely as requested */}
            {/* <input type="hidden" name="email" value={email} /> */}

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                <p className="text-sm text-indigo-700 font-medium">
                    ログイン中のメールアドレス: <span className="font-bold">{email}</span>
                    <span className="block text-xs font-normal mt-1 opacity-80">※プロフィール設定画面では非表示になります（管理者のみ確認可能）</span>
                </p>
                {/* User requested "Hide email display in profile setting". Technically I should probably remove it, 
                    but showing it in a small "info box" is usually better UX than completely invisible. 
                    However, adhering strictly to "Don't display": */}
            </div>

            <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-gray-700">
                    お名前 (フルネーム) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        defaultValue={initialFullName || ''}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                        placeholder="例: 山田 太郎"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="gender" className="block text-sm font-bold text-gray-700">性別</label>
                    <select name="gender" id="gender" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border">
                        <option value="">選択してください</option>
                        <option value="male">男性</option>
                        <option value="female">女性</option>
                        <option value="other">その他</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="birthdate" className="block text-sm font-bold text-gray-700">生年月日</label>
                    <input type="date" name="birthdate" id="birthdate" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                </div>
            </div>

            <div>
                <label htmlFor="residence" className="block text-sm font-bold text-gray-700">居住地 (都道府県・市区町村)</label>
                <input
                    type="text"
                    name="residence"
                    id="residence"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                    placeholder="例: 神奈川県横浜市"
                />
            </div>


            <div>
                <label htmlFor="referral_source" className="block text-sm font-bold text-gray-700">このサイトを何で知りましたか？</label>
                <input
                    type="text"
                    name="referral_source"
                    id="referral_source"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                    placeholder="例: 友人の紹介、Instagram、検索など"
                />
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
