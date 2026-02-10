import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { type NextRequest, NextResponse } from 'next/server'

const REFERRAL_COOKIE_NAME = 'referral_code'

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Netlifyでは request.nextUrl.origin が内部URLになることがあるため
    // x-forwarded-host を使って正しい公開URLを取得する
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
    const origin = request.nextUrl.origin
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const redirectBase = (!isLocalEnv && forwardedHost)
        ? `${forwardedProto}://${forwardedHost}`
        : origin

    console.log('[GoogleLogin] Step3: callbackに到着', { origin, forwardedHost, redirectBase, hasCode: !!code })

    // Google側からのエラー
    if (error) {
        console.error('[GoogleLogin] Step3: Googleエラー', { error, errorDescription })
        return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(errorDescription || error)}`)
    }

    if (!code) {
        console.error('[GoogleLogin] Step3: codeなし')
        return NextResponse.redirect(`${redirectBase}/login?error=no_code`)
    }

    // ---- ここが重要 ----
    // cookies() を使わず、request.cookies / response.cookies に直接読み書きする
    // これにより NextResponse.redirect() のレスポンスにCookieが確実に含まれる
    const redirectUrl = `${redirectBase}${next}`
    let response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    // request.cookies にも反映（後続の getAll で読めるように）
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    // response を再構築して Cookie を載せる
                    response = NextResponse.redirect(redirectUrl)
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    console.log('[GoogleLogin] Step4: codeをセッションに交換中...')
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
        console.error('[GoogleLogin] Step4: セッション交換エラー', {
            message: sessionError.message,
            status: sessionError.status,
        })
        return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(sessionError.message)}`)
    }

    if (!sessionData?.user) {
        console.error('[GoogleLogin] Step4: ユーザーデータなし')
        return NextResponse.redirect(`${redirectBase}/login?error=no_user`)
    }

    const user = sessionData.user
    console.log('[GoogleLogin] Step5: ログイン成功', { userId: user.id, email: user.email })

    // プロフィール作成/更新
    try {
        const supabaseAdmin = createAdminClient()
        const googleName = user.user_metadata?.full_name || user.user_metadata?.name || null
        const referralCode = request.cookies.get(REFERRAL_COOKIE_NAME)?.value || null

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
            }
        } else {
            await supabaseAdmin
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name: googleName,
                    role: 'user',
                    referred_by: referralCode,
                })
        }

        // リファラルCookieをクリア
        if (referralCode) {
            response.cookies.set(REFERRAL_COOKIE_NAME, '', { path: '/', maxAge: 0 })
        }
    } catch (profileError) {
        console.error('[GoogleLogin] Step5: プロフィール処理エラー（ログインは続行）', profileError)
    }

    console.log('[GoogleLogin] Step6: リダイレクト', { redirectUrl })
    return response
}
