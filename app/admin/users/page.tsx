import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/utils/admin'
import { createAdminClient } from '@/utils/supabase/admin-client'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    // 1. Check Admin Permission
    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
        redirect('/')
    }

    // 2. Fetch Users (using Admin Client to bypass RLS)
    const supabaseAdmin = createAdminClient()
    const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, avatar_url, role, updated_at')
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching profiles:', error)
        return <div className="p-8 text-red-600">ユーザー情報の取得に失敗しました</div>
    }

    return (
        <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">ユーザー一覧</h1>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    全 {profiles?.length || 0} 名
                </span>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ユーザー
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                    メールアドレス
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    権限
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    アクション
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {profiles?.map((profile) => (
                                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {profile.avatar_url ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={profile.avatar_url} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                        {profile.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{profile.full_name || '未設定'}</div>
                                                <div className="text-xs text-gray-500 sm:hidden">{profile.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <div className="text-sm text-gray-500">{profile.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {profile.role === 'admin' ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                                管理者
                                            </span>
                                        ) : profile.role === 'moderator' ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                副管理者
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                一般
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/users/${profile.id}/edit`}
                                                className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors border border-gray-200"
                                            >
                                                編集
                                            </Link>
                                            <Link
                                                href={`/admin/messages/${profile.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-md transition-colors"
                                            >
                                                メッセージ
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
