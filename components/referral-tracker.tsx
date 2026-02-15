'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { recordReferralVisit } from '@/app/actions/referral'

export default function ReferralTracker() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const processedRef = useRef<string | null>(null)

    useEffect(() => {
        const ref = searchParams.get('ref')

        // Prevent double recording for the same ref on the same page load (React Strict Mode double invokation)
        if (ref && processedRef.current !== ref) {
            processedRef.current = ref

            // Execute server action without blocking UI
            recordReferralVisit(ref, pathname)
        }
    }, [searchParams, pathname])

    return null // Invisible component
}
