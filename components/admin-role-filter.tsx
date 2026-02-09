'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const ROLES = [
    { value: '', label: '自分の権限で表示' },
    { value: 'user', label: '新規ユーザーとして表示' },
    { value: 'lead', label: 'アム出しとして表示' },
    { value: 'member', label: 'メンバーとして表示' },
    { value: 'moderator', label: '副管理者として表示' },
    { value: 'admin', label: '管理者として表示' },
]

export default function AdminRoleFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentRole = searchParams.get('previewRole') || ''

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString())

        if (e.target.value) {
            params.set('previewRole', e.target.value)
        } else {
            params.delete('previewRole')
        }

        const category = params.get('category')
        const previewRole = params.get('previewRole')

        let url = '/'
        const queryParts = []
        if (category) queryParts.push(`category=${category}`)
        if (previewRole) queryParts.push(`previewRole=${previewRole}`)
        if (queryParts.length > 0) url += '?' + queryParts.join('&')

        router.push(url)
    }

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm font-bold text-orange-700 flex items-center gap-1">
                    🔧 管理者プレビュー
                </span>
                <select
                    value={currentRole}
                    onChange={handleChange}
                    className="text-sm border border-orange-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                >
                    {ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
                {currentRole && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        {ROLES.find(r => r.value === currentRole)?.label}モードで閲覧中
                    </span>
                )}
            </div>
        </div>
    )
}
