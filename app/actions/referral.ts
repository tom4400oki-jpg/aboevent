'use server'

import { createAdminClient } from '@/utils/supabase/admin-client'
import { headers } from 'next/headers'

export async function recordReferralVisit(referralCode: string, path: string) {
    if (!referralCode) return

    try {
        const supabaseAdmin = createAdminClient()

        // 1. Convert referral code to user ID
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('referral_code', referralCode)
            .single()

        if (!profile) return // Invalid code

        // 2. Record visit
        // We use admin client because RLS might block anonymous inserts or we want to ensure it works even if not logged in
        await supabaseAdmin
            .from('referral_visits')
            .insert({
                referrer_id: profile.id,
                path: path,
                // visited_at is default now()
            })

    } catch (error) {
        console.error('Referral tracking error:', error)
        // Fail silently to not impact user experience
    }
}
