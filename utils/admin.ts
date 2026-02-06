import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const isAdmin = cache(async (): Promise<boolean> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (error || !data) {
            return false
        }

        return data.role === 'admin'
    } catch (error) {
        console.error('isAdmin check failed:', error)
        return false
    }
})

export const getRole = cache(async (): Promise<'admin' | 'moderator' | 'member' | 'lead' | 'user'> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return 'user'

    // Safety fallback for Owner
    if (user.email === 'tom4400oki@gmail.com') {
        return 'admin'
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (error || !data) return 'user'
        return (data.role as 'admin' | 'moderator' | 'member' | 'lead' | 'user') || 'user'
    } catch {
        return 'user'
    }
})

// Permissions
export const canManageEvents = async () => {
    const role = await getRole()
    return role === 'admin' || role === 'moderator'
}

export const getAdminProfile = cache(async () => {
    const supabase = await createClient()

    // Try to find the primary admin (hardcoded as fallback for safety)
    const adminEmail = 'tom4400oki@gmail.com'

    const { data: admin } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('role', 'admin')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    if (admin) return admin

    // Fallback if role is not set correctly yet
    const { data: fallbackAdmin } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', adminEmail)
        .single()

    return fallbackAdmin || null
})
