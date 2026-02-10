import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/utils/admin'

export default async function AdminMessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const hasAdminAccess = await isAdmin()

    if (!user || !hasAdminAccess) {
        redirect('/')
    }

    // 1. Fetch ALL messages using Admin Client to verify system-wide conversations
    const adminSupabase = createAdminClient()
    const { data: messages } = await adminSupabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

    if (!messages) return <div>Loading...</div>

    // 2. Identify all unique users involved
    const userIds = new Set<string>()
    messages.forEach(msg => {
        userIds.add(msg.sender_id)
        userIds.add(msg.receiver_id)
    })

    // 3. Fetch profiles for all involved users to check roles and names
    const { data: profiles } = await adminSupabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .in('id', Array.from(userIds))

    const profilesMap = new Map()
    profiles?.forEach(p => profilesMap.set(p.id, p))

    // 4. Group conversations by "End User"
    // We want to list conversations with users who are NOT admins/moderators if possible,
    // or just list everyone we talked to.
    // Strategy: For each message, find the "counterparty".
    // If sender is admin-role, counterparty is receiver.
    // If receiver is admin-role, counterparty is sender.
    // Note: This logic assumes conversation is usually Admin <-> User.

    // To simplify: We list "Users" who have messages.
    // A "User" definition here: Someone who is NOT an admin/moderator, OR just anyone displayed as a thread.
    // Let's filter out "admin/moderator" from the thread list view, treating them as the "Operator" side.
    // But wait, what if an admin messages another admin?
    // For now, let's treat every unique user ID that is NOT 'admin'/'moderator' as a thread entry.

    const threadsMap = new Map()

    messages.forEach(msg => {
        const sender = profilesMap.get(msg.sender_id)
        const receiver = profilesMap.get(msg.receiver_id)

        // Identify the "Customer" side of the conversation
        let customerId = null
        let customerProfile = null

        const isSenderAdmin = sender?.role === 'admin' || sender?.role === 'moderator'
        const isReceiverAdmin = receiver?.role === 'admin' || receiver?.role === 'moderator'

        if (!isSenderAdmin) {
            customerId = msg.sender_id
            customerProfile = sender
        } else if (!isReceiverAdmin) {
            customerId = msg.receiver_id
            customerProfile = receiver
        } else {
            // Both are admins, or role fetch failed.
            // Skip admin-to-admin chat for this user list view to keep it clean for "Customer Support" style
            return
        }

        if (!customerId) return // Should not happen given logic above

        // Determine if this message is unread (User sent it, and it's not read)
        // Note: msg.receiver_id is the admin side in this context
        const isUnread = !msg.is_read && msg.sender_id === customerId

        if (!threadsMap.has(customerId)) {
            threadsMap.set(customerId, {
                userId: customerId,
                user: customerProfile,
                lastMessage: msg,
                unreadCount: isUnread ? 1 : 0
            })
        } else {
            const thread = threadsMap.get(customerId)
            if (isUnread) {
                thread.unreadCount += 1
            }
            // Messages are ordered desc, so the first one we see is the lastMessage.
            // No need to update lastMessage unless we iterate differently.
        }
    })

    const conversations = Array.from(threadsMap.values())

    return (
        <main className="mx-auto max-w-4xl py-10 px-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-gray-900">メッセージ一覧</h1>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-100">
                    全ユーザー
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {conversations.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="text-5xl mb-4">💬</div>
                        <p className="text-gray-500 font-medium">まだメッセージはありません</p>
                    </div>
                ) : (
                    conversations.map(conv => (
                        <Link
                            key={conv.userId}
                            href={`/admin/messages/${conv.userId}`}
                            className="block p-5 sm:p-6 hover:bg-gray-50/80 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-black text-lg">
                                    {conv.user?.full_name?.charAt(0) || conv.user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {conv.user?.full_name || conv.user?.email || 'Unknown User'}
                                            <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {conv.user?.role === 'lead' ? 'アム出し' : conv.user?.role === 'member' ? 'メンバー' : 'ユーザー'}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                            {new Date(conv.lastMessage.created_at).toLocaleDateString('ja-JP')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm text-gray-500 truncate leading-relaxed">
                                            {conv.lastMessage.sender_id !== conv.userId && (
                                                <span className="text-gray-400 font-medium mr-1.5 line-through decoration-transparent">Admin:</span>
                                            )}
                                            {conv.lastMessage.content}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-4 ring-white shadow-sm">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-gray-300 group-hover:text-indigo-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    )
}
