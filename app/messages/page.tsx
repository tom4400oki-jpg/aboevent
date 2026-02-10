import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getEffectiveUser } from '@/utils/admin'
import ChatInterface from './chat-interface'

export default async function MessagesPage() {
    const supabase = await createClient()
    const user = await getEffectiveUser()

    if (!user) redirect('/login')

    // Fetch messages between User and Admin
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true })

    // Filter relevant messages (User <-> Admin)
    // In a single-user view, we show all messages where the user is sender or receiver.
    // The previous filtering by specific admin ID was too restrictive if multiple admins exist.
    const chatMessages = messages || []

    return (
        <main className="mx-auto max-w-4xl py-10 px-4 sm:px-6 lg:px-8 h-[calc(100vh-80px)]">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
                <div className="p-3 border-b border-gray-200 bg-[#6B8DB5] flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center overflow-hidden shadow-sm relative border border-gray-100">
                        <Image
                            src="/admin-icon.png"
                            alt="Admin"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="font-bold text-white">Funny-spo</h1>
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
