import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminProfile } from '@/utils/admin'
import ChatInterface from './chat-interface'

export default async function MessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Find Admin ID
    const adminProfile = await getAdminProfile()

    // Fetch messages between User and Admin
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true })

    // Filter relevant messages (User <-> Admin) if system expands, 
    // but for now RLS policies probably return mostly these.
    // We should be specific if we add other users later.

    // Simple verification to ensure we only show Admin chat here for now
    const chatMessages = messages?.filter(m =>
        (m.sender_id === user.id && m.receiver_id === adminProfile?.id) ||
        (m.sender_id === adminProfile?.id && m.receiver_id === user.id)
    ) || []

    return (
        <main className="mx-auto max-w-4xl py-10 px-4 sm:px-6 lg:px-8 h-[calc(100vh-80px)]">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
                <div className="p-3 border-b border-gray-200 bg-[#6B8DB5] flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center text-gray-600 font-bold shadow-sm">
                        A
                    </div>
                    <div>
                        <h1 className="font-bold text-white">管理者</h1>
                        <p className="text-[11px] text-white/70">運営事務局</p>
                    </div>
                </div>

                <ChatInterface
                    initialMessages={chatMessages}
                    currentUserId={user.id}
                />
            </div>
        </main>
    )
}
