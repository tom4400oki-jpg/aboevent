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
    const errorDescription = searchParams.get('error_description')

    console.log('[GoogleLogin] Step3: callbackルートに到着', {
        origin,
        hasCode: !!code,
        hasError: !!error,
        fullUrl: request.url,
    })

    // Google側からエラーが返ってきた場合
    if (error) {
        console.error('[GoogleLogin] Step3: Google側エラー', { error, errorDescription })
        return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || error)}`
        )
    }

    if (!code) {
        console.error('[GoogleLogin] Step3: codeが見つかりません')
        return NextResponse.redirect(`${origin}/login?error=no_code`)
    }

    // codeをセッションに交換
    const supabase = await createClient()
    console.log('[GoogleLogin] Step4: codeをセッションに交換中...')
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
        console.error('[GoogleLogin] Step4: セッション交換エラー', {
            message: sessionError.message,
            name: sessionError.name,
            status: sessionError.status,
        })
        return NextResponse.redirect(
            `${origin}/login?error=session_exchange_failed&message=${encodeURIComponent(sessionError.message)}`
        )
    }

    if (!sessionData?.user) {
        console.error('[GoogleLogin] Step4: セッションデータにユーザーが含まれていません')
        return NextResponse.redirect(`${origin}/login?error=no_user_in_session`)
    }

    const user = sessionData.user
    console.log('[GoogleLogin] Step5: ログイン成功', { userId: user.id, email: user.email })

    // プロフィール作成/更新
    const supabaseAdmin = createAdminClient()
    const googleName = user.user_metadata?.full_name || user.user_metadata?.name || null
    const userEmail = user.email

    const cookieStore = await cookies()
    const referralCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value || null

    try {
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name')
            .eq('id', user.id)
            .single()

        if (existingProfile) {
            if (!existingProfile.full_name && googleName) {
                await supabaseAdmin
                    .from('profiles')
                    .update({ full_name: googleName })
                    .eq('id', user.id)
                console.log('[GoogleLogin] Step5: プロフィール名を更新しました')
            }
        } else {
            await supabaseAdmin
                .from('profiles')
                .insert({
                    id: user.id,
                    email: userEmail,
                    full_name: googleName,
                    role: 'user',
                    referred_by: referralCode,
                })
            console.log('[GoogleLogin] Step5: 新規プロフィールを作成しました')
        }
    } catch (profileError) {
        console.error('[GoogleLogin] Step5: プロフィール処理エラー（ログインは続行）', profileError)
    }

    // リダイレクト
    console.log('[GoogleLogin] Step6: トップページへリダイレクト', { next })
    const response = NextResponse.redirect(`${origin}${next}`)
    if (referralCode) {
        response.cookies.set(REFERRAL_COOKIE_NAME, '', { path: '/', maxAge: 0 })
    }
    return response
}
