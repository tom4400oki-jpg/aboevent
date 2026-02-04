'use client'

import { useState, useRef, useEffect } from 'react'
import { sendMessage } from './actions'

interface Message {
    id: string
    sender_id: string
    content: string
    created_at: string
}

interface ChatInterfaceProps {
    initialMessages: Message[]
    currentUserId: string
    receiverId?: string // Optional for user view (defaults to admin), required for admin view
}

export default function ChatInterface({ initialMessages, currentUserId, receiverId }: ChatInterfaceProps) {
    // Optimistic UI could be added here, but simple state is fine for now
    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [initialMessages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isSending) return

        setIsSending(true)
        const content = input
        setInput('') // Clear immediately

        await sendMessage(content, receiverId)
        setIsSending(false)
        // Revalidation in action handles the update, but for better UX we might want optimistics.
        // For MVP, the server refresh via action is acceptable.
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
                {initialMessages.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 text-sm">
                        メッセージはまだありません。<br />
                        不明点やご要望があればお送りください。
                    </div>
                ) : (
                    initialMessages.map(msg => {
                        const isMe = msg.sender_id === currentUserId
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="メッセージを入力..."
                        className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isSending}
                        className="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600"
                    >
                        <svg className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    )
}
