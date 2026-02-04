import { redirect, notFound } from 'next/navigation'
import { isAdmin } from '@/utils/admin'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { updateProfile } from '../../../actions'

export default async function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    // 1. Check Admin Permission
    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
        redirect('/')
    }

    const { id } = await params
    const supabaseAdmin = createAdminClient()

    // 2. Fetch User Profile
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !profile) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">ユーザー情報編集 (管理者専用)</h1>

            <form action={updateProfile} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <input type="hidden" name="id" value={profile.id} />

                <div>
                    <label className="block text-sm font-bold text-gray-700">ユーザーID (変更不可)</label>
                    <input type="text" disabled defaultValue={profile.id} className="mt-1 block w-full rounded-md border-gray-300 border bg-gray-100 p-2 text-gray-500" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">メールアドレス (変更不可)</label>
                    <input type="text" disabled defaultValue={profile.email} className="mt-1 block w-full rounded-md border-gray-300 border bg-gray-100 p-2 text-gray-500" />
                    <p className="text-xs text-gray-500 mt-1">※メールアドレスの変更はデータベース直接操作が必要です</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">氏名</label>
                    <input type="text" name="full_name" defaultValue={profile.full_name || ''} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700">権限 (Role)</label>
                    <select name="role" required defaultValue={profile.role || 'user'} className="mt-1 block w-full rounded-md border-gray-300 border p-2">
                        <option value="user">一般ユーザー (user)</option>
                        <option value="moderator">副管理者 (moderator)</option>
                        <option value="admin">管理者 (admin)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1 space-y-1">
                        <span className="block">・一般ユーザー: 一般機能のみ</span>
                        <span className="block">・副管理者: イベント作成・編集、メッセージ機能</span>
                        <span className="block">・管理者: 全機能（ユーザー管理を含む）</span>
                    </p>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        更新する
                    </button>
                    <a href="/admin/users" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold text-center">
                        キャンセル
                    </a>
                </div>
            </form>
        </div>
    )
}
