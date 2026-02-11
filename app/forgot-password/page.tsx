'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setErrorMessage(null)

        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
        })

        if (error) {
            setStatus('error')
            setErrorMessage(error.message)
        } else {
            setStatus('success')
        }
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 text-center">メールを送信しました</h1>
                <p className="text-gray-600 text-center max-w-md">
                    <strong>{email}</strong> 宛にパスワード再設定用のリンクを送信しました。<br />
                    メール内のリンクをクリックして、新しいパスワードを設定してください。
                </p>
                <div className="pt-4">
                    <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
                    パスワードをお忘れの方
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    登録したメールアドレスを入力してください。<br />
                    再設定用リンクをお送りします。
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl ring-1 ring-gray-100 sm:rounded-2xl sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                メールアドレス
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="user@example.com"
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            エラーが発生しました
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{errorMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {status === 'loading' ? '送信中...' : '再設定用リンクを送信'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            ログイン画面に戻る
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
