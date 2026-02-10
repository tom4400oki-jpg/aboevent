import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const REFERRAL_COOKIE_NAME = 'referral_code'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth error:', error)
            const errorMessage = encodeURIComponent(error.message || 'Unknown error')
            const errorDesc = encodeURIComponent(error.name || '')
            return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed&message=${errorMessage}&desc=${errorDesc}`)
        }

        if (sessionData?.user) {
            const user = sessionData.user
            const supabaseAdmin = createAdminClient()

            // Googleからのユーザー情報を取得（名前のみ）
            const googleName = user.user_metadata?.full_name || user.user_metadata?.name || null
            const userEmail = user.email

            // リファラルCookieから紹介者IDを取得
            const cookieStore = await cookies()
            const referralCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value || null

            try {
                // 既存のprofileを確認
                const { data: existingProfile } = await supabaseAdmin
                    .from('profiles')
                    .select('id, full_name')
                    .eq('id', user.id)
                    .single()

                if (existingProfile) {
                    // 既存profileがある場合: 名前が空なら更新
                    if (!existingProfile.full_name && googleName) {
                        await supabaseAdmin
                            .from('profiles')
                            .update({ full_name: googleName })
                            .eq('id', user.id)
                    }
                } else {
                    // 新規profile作成（紹介者IDも記録）
                    await supabaseAdmin
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: userEmail,
                            full_name: googleName,
                            role: 'user',
                            referred_by: referralCode,
                        })
                }
            } catch (profileError) {
                // プロファイル作成エラーはログに出すが、ログイン自体はブロックしない
                console.error('Profile creation error:', profileError)
            }

            // リファラルCookieを削除（使用済み）
            const response = NextResponse.redirect(`${origin}${next}`)
            if (referralCode) {
                response.cookies.set(REFERRAL_COOKIE_NAME, '', {
                    path: '/',
                    maxAge: 0,
                })
            }
            return response
        }
    }

    // エラー時はログインページへリダイレクト
    return NextResponse.redirect(`${origin}/login?error=no_session_or_code`)
}
