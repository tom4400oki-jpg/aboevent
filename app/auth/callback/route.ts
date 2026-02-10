import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const REFERRAL_COOKIE_NAME = 'referral_code'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    console.log('[Auth Debug] Callback route hit:', {
        fullUrl: request.url,
        origin,
        hasCode: !!code,
        hasError: !!error,
    })

    // Googleからのコールバック自体にエラーが含まれている形跡がある場合
    if (error) {
        console.error('[Auth Debug] Auth callback received error:', error, error_description)
        return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=${encodeURIComponent(error_description || error)}`)
    }

    if (code) {
        const supabase = await createClient()
        console.log('[Auth Debug] Exchanging code for session...')
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError) {
            console.error('Auth exchange error:', sessionError)
            const errorMessage = encodeURIComponent(sessionError.message || 'Unknown error')
            const errorDesc = encodeURIComponent(sessionError.name || '')
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
                    // 以前に同じメールアドレスで登録されていたが削除されたなどのケースも考慮し、
                    // upsertではなくinsertを使用しているが、念のためエラーハンドリングは強化済み
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
                console.error('Profile creation/update error:', profileError)
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
    console.error('No code provided in auth callback')
    return NextResponse.redirect(`${origin}/login?error=no_code_provided`)
}
