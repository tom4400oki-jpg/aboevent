'use client'

import { useState } from 'react'

export default function CopyReferralButton({ userId }: { userId: string }) {
    const [copied, setCopied] = useState(false)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

    const handleCopy = async () => {
        const url = `${siteUrl}/?ref=${userId}`
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // フォールバック
            const textArea = document.createElement('textarea')
            textArea.value = url
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <button
            onClick={handleCopy}
            className={`text-xs px-2.5 py-1.5 rounded-md transition-colors font-bold ${copied
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            title={`紹介URL: ${siteUrl}/?ref=${userId}`}
        >
            {copied ? 'コピー済み' : '紹介URL'}
        </button>
    )
}
