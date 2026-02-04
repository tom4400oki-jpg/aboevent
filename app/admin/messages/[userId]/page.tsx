import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatInterface from '@/app/messages/chat-interface'

interface PageProps {
    params: Promise<{
        userId: string
    }>
}

import { canManageEvents } from '@/utils/admin'

export default async function AdminChatPage({ params }: PageProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { userId } = await params
    const hasAccess = await canManageEvents()

    if (!hasAccess || !user) {
        redirect('/')
    }

    // Fetch Target User details
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single()

    // Fetch messages
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

    return (
        <main className="mx-auto max-w-4xl py-10 px-4 sm:px-6 lg:px-8 h-[calc(100vh-80px)]">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-orange-50 flex items-center gap-3">
                    <a href="/admin/messages" className="text-gray-400 hover:text-gray-600 mr-2">
                        ←
                    </a>
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        U
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">{targetProfile?.full_name || 'User'}</h1>
                        <p className="text-xs text-gray-500">{targetProfile?.email}</p>
                    </div>
                </div>

                <ChatInterface
                    initialMessages={messages || []}
                    currentUserId={user.id}
                    receiverId={userId}
                />
            </div>
        </main>
    )
}
