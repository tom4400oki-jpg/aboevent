import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { cache } from 'react'
import { cookies } from 'next/headers'

const VIEW_AS_USER_COOKIE = 'view_as_user'
const IMPERSONATE_ID_COOKIE = 'impersonate_id'
export const IMPERSONATE_USER_ID = '00000000-0000-0000-0000-000000000000'

// プレビューモード時に使用するダミーユーザー情報
const DUMMY_USER = {
    id: IMPERSONATE_USER_ID,
    email: 'viewer@funny-spo.com',
    role: 'user' as const,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
}

export const getEffectiveUser = cache(async () => {
    const supabase = await createClient()
    const { data: { user: realUser } } = await supabase.auth.getUser()

    if (!realUser) return null

    // クッキーチェック
    const cookieStore = await cookies()
    const isPreview = cookieStore.get(VIEW_AS_USER_COOKIE)?.value === 'true'
    const impersonateId = cookieStore.get(IMPERSONATE_ID_COOKIE)?.value

    if (!isPreview) return realUser

    // 実際のユーザーが管理者かどうかチェック（DBアクセス）
    // ※ ここで再帰しないように注意 (getRoleなどは使わず直接クエリ)
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role') // impersonate_user_id は不要になったため削除
            .eq('id', realUser.id)
            .single()

        const isRealAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

        if (isRealAdmin) {
            // Cookieで指定されたターゲットがいる場合
            if (impersonateId) {
                const { data: targetProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', impersonateId)
                    .single()

                if (targetProfile) {
                    // ターゲットユーザーになりすまし (AuthUser型に合わせる)
                    return {
                        id: targetProfile.id,
                        app_metadata: {},
                        user_metadata: {},
                        aud: 'authenticated',
                        created_at: targetProfile.created_at,
                        email: targetProfile.email, // email is optional in User type but usually present
                        phone: '',
                        confirmed_at: targetProfile.created_at,
                        last_sign_in_at: targetProfile.created_at,
                        role: 'authenticated',
                        updated_at: targetProfile.updated_at
                    } as any // User型へのキャストが必要な場合があるため
                }
            }

            // 何も指定がない、またはターゲットが見つからない場合はデフォルトのダミーユーザー
            return DUMMY_USER
        }
    } catch (e) {
        console.error('Error checking admin status for impersonation:', e)
    }

    return realUser
})

export const isAdmin = cache(async (): Promise<boolean> => {
    const role = await getRole()
    return role === 'admin'
})

export const isViewAsUser = async (): Promise<boolean> => {
    const cookieStore = await cookies()
    return cookieStore.get(VIEW_AS_USER_COOKIE)?.value === 'true'
}

export const getRole = cache(async (): Promise<'admin' | 'moderator' | 'member' | 'lead' | 'user'> => {
    const user = await getEffectiveUser()
    if (!user) return 'user'

    // ダミーユーザーの場合は即座にuserを返す
    if (user.id === IMPERSONATE_USER_ID) return 'user'

    const supabase = await createClient()
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

// 互換性のために残すが、基本は getRole を使うべき
export const getEffectiveRole = async (): Promise<'admin' | 'moderator' | 'member' | 'lead' | 'user'> => {
    return getRole()
}


export const getAdminProfile = cache(async () => {
    // Adminクライアントを使用してRLSを回避し、確実に管理者を取得する
    const supabase = createAdminClient()

    // 最初に登録されたadminまたはmoderatorロールのユーザーを取得
    const { data: admin } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('role', ['admin', 'moderator']) // adminだけでなくmoderatorも許可
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    return admin || null
})
