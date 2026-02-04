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

    // Group by User
    const conversationsMap = new Map()

    messages.forEach((msg: any) => {
        const isMeSender = msg.sender_id === user.id
        const otherUserId = isMeSender ? msg.receiver_id : msg.sender_id
        const otherUser = isMeSender ? msg.receiver : msg.sender

        if (!conversationsMap.has(otherUserId)) {
            conversationsMap.set(otherUserId, {
                userId: otherUserId,
                user: otherUser,
                lastMessage: msg,
            })
        }
    })

    const conversations = Array.from(conversationsMap.values())

    return (
        <main className="mx-auto max-w-4xl py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">メッセージ一覧 (管理者)</h1>

            <div className="bg-white rounded-xl shadow border border-gray-200 divide-y divide-gray-100">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">まだメッセージはありません</div>
                ) : (
                    conversations.map(conv => (
                        <Link
                            key={conv.userId}
                            href={`/admin/messages/${conv.userId}`}
                            className="block p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-gray-900">
                                    {conv.user?.full_name || conv.user?.email || 'Unknown User'}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {new Date(conv.lastMessage.created_at).toLocaleString()}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1">
                                {conv.lastMessage.sender_id === user.id ? 'You: ' : ''}{conv.lastMessage.content}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </main>
    )
}
