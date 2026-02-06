import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminMessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== 'tom4400oki@gmail.com') {
        redirect('/')
    }

    // Get all messages sent TO admin (to find users who messaged)
    // Also get messages sent BY admin (to see who I talked to)
    // This is a bit complex in SQL, typically we want "Conversations".
    // For MVP, fetch all messages related to Admin and group by 'other_party' in JS.
    const { data: messages } = await supabase
        .from('messages')
        .select(`
            *,
            sender:sender_id(full_name, email, avatar_url),
            receiver:receiver_id(full_name, email, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

    if (!messages) return <div>Loading...</div>

    // Group by User and calculate metadata
    const conversationsMap = new Map()

    messages.forEach((msg: any) => {
        const isMeSender = msg.sender_id === user.id
        const otherUserId = isMeSender ? msg.receiver_id : msg.sender_id
        const otherUser = isMeSender ? msg.receiver : msg.sender
        const isUnread = !msg.is_read && msg.receiver_id === user.id

        if (!conversationsMap.has(otherUserId)) {
            conversationsMap.set(otherUserId, {
                userId: otherUserId,
                user: otherUser,
                lastMessage: msg,
                unreadCount: isUnread ? 1 : 0
            })
        } else if (isUnread) {
            const entry = conversationsMap.get(otherUserId)
            entry.unreadCount += 1
        }
    })

    const conversations = Array.from(conversationsMap.values())

    return (
        <main className="mx-auto max-w-4xl py-10 px-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-gray-900">メッセージ一覧</h1>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-100">
                    管理者用
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
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                            {new Date(conv.lastMessage.created_at).toLocaleDateString('ja-JP')}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm text-gray-500 truncate leading-relaxed">
                                            {conv.lastMessage.sender_id === user.id && (
                                                <span className="text-gray-400 font-medium mr-1.5 line-through decoration-transparent">You:</span>
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
