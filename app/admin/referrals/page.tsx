import { redirect } from 'next/navigation'
import { isAdmin } from '@/utils/admin'
import { createAdminClient } from '@/utils/supabase/admin-client'

export const dynamic = 'force-dynamic'

export default async function AdminReferralsPage() {
    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
        redirect('/')
    }

    const supabaseAdmin = createAdminClient()

    // 全プロフィールを取得 (referral_codeを追加)
    const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, avatar_url, referred_by, referral_code')

    // 全予約を取得（referrer_idがあるもの）
    const { data: bookingsWithReferrers } = await supabaseAdmin
        .from('bookings')
        .select('id, referrer_id, user_id, event_id, events(title)')
        .not('referrer_id', 'is', null)

    // 訪問記録を取得
    const { data: visits } = await supabaseAdmin
        .from('referral_visits')
        .select('id, referrer_id, path, visited_at')

    if (!profiles) {
        return <div className="p-8 text-red-600">データの取得に失敗しました</div>
    }

    // プロフィールマップ
    const profileMap = new Map(profiles.map(p => [p.id, p]))

    // 訪問数をカウント
    const visitCounts: Record<string, number> = {}
        ; (visits || []).forEach((v: any) => {
            if (v.referrer_id) {
                visitCounts[v.referrer_id] = (visitCounts[v.referrer_id] || 0) + 1
            }
        })

    // 紹介サインアップ数をカウント
    const signupCounts: Record<string, number> = {}
    profiles.forEach(p => {
        if (p.referred_by) {
            signupCounts[p.referred_by] = (signupCounts[p.referred_by] || 0) + 1
        }
    })

    // 紹介予約数をカウント
    const bookingCounts: Record<string, number> = {}
        ; (bookingsWithReferrers || []).forEach((b: any) => {
            if (b.referrer_id) {
                bookingCounts[b.referrer_id] = (bookingCounts[b.referrer_id] || 0) + 1
            }
        })

    // 紹介実績のあるユーザーをリストアップ（訪問も含む）
    const referrerIds = new Set([
        ...Object.keys(visitCounts),
        ...Object.keys(signupCounts),
        ...Object.keys(bookingCounts),
    ])

    // ソート（合計スコアの多い順）
    const referrers = Array.from(referrerIds)
        .map(id => ({
            id,
            profile: profileMap.get(id),
            visitCount: visitCounts[id] || 0,
            signupCount: signupCounts[id] || 0,
            bookingCount: bookingCounts[id] || 0,
        }))
        .sort((a, b) => (b.visitCount + b.signupCount + b.bookingCount) - (a.visitCount + a.signupCount + a.bookingCount))

    // サイトURL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // 合計
    const totalVisits = Object.values(visitCounts).reduce((a, b) => a + b, 0)
    const totalSignups = Object.values(signupCounts).reduce((a, b) => a + b, 0)
    const totalBookings = Object.values(bookingCounts).reduce((a, b) => a + b, 0)

    return (
        <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">紹介トラッキング</h1>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-100">
                    管理者用
                </div>
            </div>

            {/* 概要カード */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
                    <div className="text-3xl font-black text-blue-600">{totalVisits}</div>
                    <div className="text-sm text-gray-500 font-medium mt-1">閲覧数</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
                    <div className="text-3xl font-black text-indigo-600">{totalSignups}</div>
                    <div className="text-sm text-gray-500 font-medium mt-1">ユーザー登録</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center">
                    <div className="text-3xl font-black text-green-600">{totalBookings}</div>
                    <div className="text-sm text-gray-500 font-medium mt-1">イベント予約</div>
                </div>
            </div>

            {/* 紹介者別テーブル */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">紹介者別の実績</h2>
                </div>

                {referrers.length === 0 ? (
                    <div className="text-center p-12">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="text-gray-500 font-medium">まだ紹介実績はありません</p>
                        <p className="text-gray-400 text-sm mt-2">
                            ユーザーに <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{siteUrl}/?ref=紹介コード</code> を共有してもらいましょう
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">紹介者</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">紹介コード</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">閲覧</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">登録</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">予約</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {referrers.map(referrer => {
                                    return (
                                        <tr key={referrer.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {referrer.profile?.avatar_url ? (
                                                        <img src={referrer.profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
                                                            {(referrer.profile?.full_name || 'U')[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">
                                                            {referrer.profile?.full_name || '(不明)'}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400">{referrer.profile?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                    {referrer.profile?.referral_code || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <span className="text-lg font-black text-blue-600">{referrer.visitCount}</span>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <span className="text-lg font-black text-indigo-600">{referrer.signupCount}</span>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <span className="text-lg font-black text-green-600">{referrer.bookingCount}</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 全ユーザーの紹介リンク一覧 */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">全ユーザーの紹介リンク</h2>
                    <p className="text-xs text-gray-500 mt-1">各ユーザーに対応する短縮紹介URLです</p>
                </div>
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                    {profiles
                        .filter(p => p.full_name)
                        .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
                        .map(profile => (
                            <div key={profile.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                    {profile.full_name}
                                </span>
                                <div className="text-xs text-gray-400 font-mono truncate ml-4 max-w-[300px]">
                                    {siteUrl}/?ref={profile.referral_code || profile.id}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </main>
    )
}
