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

    // 最初に登録されたadminロールのユーザーを取得
    const { data: admin } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('role', 'admin')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    return admin || null
})

