'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { sendMessage, markMessagesAsRead } from './actions'

interface Message {
    id: string
    sender_id: string
    content: string
    created_at: string
}

interface ChatInterfaceProps {
    initialMessages: Message[]
    currentUserId: string
    receiverId?: string
    isAdminMode?: boolean
    targetUser?: {
        full_name: string | null
        email: string | null
    }
}

function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
        return '今日'
    } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨日'
    } else {
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
        })
    }
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function ChatInterface({ initialMessages, currentUserId, receiverId, isAdminMode, targetUser }: ChatInterfaceProps) {
    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [initialMessages])

    // Mark messages as read on mount
    useEffect(() => {
        const markRead = async () => {
            await markMessagesAsRead()
        }
        markRead()
    }, [])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isSending) return

        setIsSending(true)
        const content = input
        setInput('')

        await sendMessage(content, receiverId)
        setIsSending(false)
    }

    // 日付ごとにメッセージをグループ化
    const groupedMessages: { date: string; messages: Message[] }[] = []
    initialMessages.forEach((msg) => {
        const dateKey = new Date(msg.created_at).toDateString()
        const lastGroup = groupedMessages[groupedMessages.length - 1]
        if (lastGroup && lastGroup.date === dateKey) {
            lastGroup.messages.push(msg)
        } else {
            groupedMessages.push({ date: dateKey, messages: [msg] })
        }
    })

    return (
        <>
            {/* メッセージエリア - LINE風背景 */}
            <div
                className="flex-1 overflow-y-auto px-4 py-4"
                ref={scrollRef}
                style={{ backgroundColor: '#7494C0' }}
            >
                {initialMessages.length === 0 ? (
                    <div className="text-center text-white/70 py-10 text-sm">
                        メッセージはまだありません。<br />
                        不明点やご要望があればお送りください。
                    </div>
                ) : (
                    groupedMessages.map((group, gi) => (
                        <div key={gi}>
                            {/* 日付ラベル */}
                            <div className="flex justify-center my-3">
                                <span className="bg-black/20 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-sm">
                                    {formatDateLabel(group.messages[0].created_at)}
                                </span>
                            </div>

                            {/* メッセージバブル */}
                            {group.messages.map((msg) => {
                                const isMe = msg.sender_id === currentUserId
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {/* 相手側アイコン */}
                                        {!isMe && (
                                            <div className="flex-shrink-0 mr-2 mt-1">
                                                {isAdminMode ? (
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold shadow-sm border border-gray-100">
                                                        {targetUser?.full_name?.charAt(0) || targetUser?.email?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center overflow-hidden shadow-sm relative border border-gray-100">
                                                        <Image
                                                            src="/admin-icon.png"
                                                            alt="Admin"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className={`flex items-end gap-1 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* バブル */}
                                            <div
                                                className={`relative px-3 py-2 text-sm shadow-sm ${isMe
                                                    ? 'bg-[#8CE349] text-gray-900 rounded-2xl rounded-tr-sm'
                                                    : 'bg-white text-gray-900 rounded-2xl rounded-tl-sm'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                                            </div>

                                            {/* 時刻 */}
                                            <span className="text-[10px] text-white/70 flex-shrink-0 pb-0.5">
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))
                )}
            </div>

            {/* 入力エリア */}
            <div className="p-3 bg-gray-100 border-t border-gray-200">
                <form onSubmit={handleSend} className="flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend(e)
                            }
                        }}
                        placeholder="メッセージを入力..."
                        rows={1}
                        className="flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-[#8CE349] focus:outline-none focus:ring-1 focus:ring-[#8CE349] max-h-32"
                        style={{ minHeight: '40px' }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isSending}
                        className="flex-shrink-0 rounded-full bg-[#07B53B] p-2.5 text-white shadow-sm hover:bg-[#06A235] disabled:opacity-40 disabled:hover:bg-[#07B53B] transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    )
}
