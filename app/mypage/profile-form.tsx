'use client'

import { useState, useRef } from 'react'
import { updateProfile, uploadAvatar } from './actions'
import imageCompression from 'browser-image-compression'


export default function ProfileForm({
    initialFullName,
    initialAvatarUrl,
    email,
    initialGender,
    initialBirthdate,
    initialResidence,
    initialReferralSource
}: {
    initialFullName: string | null
    initialAvatarUrl: string | null
    email: string
    initialGender: string | null
    initialBirthdate: string | null
    initialResidence: string | null
    initialReferralSource: string | null
}) {
    const [loading, setLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    // ... existing code ...


    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 画像ファイルチェック
        if (!file.type.startsWith('image/')) {
            setMessage({ text: '画像ファイルを選択してください', type: 'error' })
            return
        }

        setAvatarLoading(true)
        setMessage(null)

        try {
            // 画像圧縮オプション (100KB = 0.1MB)
            const options = {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                initialQuality: 0.6, // 画質60%から開始して確実にサイズを落とす
            }

            const compressedFile = await imageCompression(file, options)

            const formData = new FormData()
            formData.append('avatar', compressedFile)

            const result = await uploadAvatar(formData)

            if (result.error) {
                setMessage({ text: result.error, type: 'error' })
            } else if (result.success && result.avatarUrl) {
                setAvatarUrl(result.avatarUrl)
                setMessage({ text: 'プロフィール画像を更新しました', type: 'success' })
            }
        } catch (error) {
            console.error('Compression error:', error)
            setMessage({ text: '画像の圧縮に失敗しました', type: 'error' })
        }

        setAvatarLoading(false)
    }


    return (
        <form action={handleSubmit} className="space-y-6">
            {/* アバター */}
            <div className="flex flex-col items-center mb-6">
                <div
                    onClick={handleAvatarClick}
                    className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group ring-4 ring-gray-100 hover:ring-indigo-200 transition-all"
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="プロフィール画像"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <svg className="w-10 h-10 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {avatarLoading ? (
                            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                />
                <p className="mt-2 text-xs text-gray-500">クリックして画像を変更</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                <p className="text-sm text-indigo-700 font-medium">
                    ログイン中のメールアドレス: <span className="font-bold">{email}</span>
                    <span className="block text-xs font-normal mt-1 opacity-80">※プロフィール設定画面では非表示になります（管理者のみ確認可能）</span>
                </p>
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
                    <select name="gender" id="gender" defaultValue={initialGender || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border">
                        <option value="">選択してください</option>
                        <option value="male">男性</option>
                        <option value="female">女性</option>
                        <option value="other">その他</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="birthdate" className="block text-sm font-bold text-gray-700">生年月日</label>
                    <input type="date" name="birthdate" id="birthdate" defaultValue={initialBirthdate || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                </div>
            </div>

            <div>
                <label htmlFor="residence" className="block text-sm font-bold text-gray-700">居住地 (都道府県・市区町村)</label>
                <input
                    type="text"
                    name="residence"
                    id="residence"
                    defaultValue={initialResidence || ''}
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
                    defaultValue={initialReferralSource || ''}
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

