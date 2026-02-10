'use client'

import { impersonateUser } from './actions'

export default function ImpersonateButton({ userId, userName }: { userId: string, userName: string | null }) {
    return (
        <form action={async () => await impersonateUser(userId)}>
            <button
                type="submit"
                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-md transition-colors text-xs font-bold flex items-center gap-1 border border-indigo-200"
                title={`${userName || 'このユーザー'}としてログイン`}
            >
                <span>👀</span> 表示
            </button>
        </form>
    )
}
