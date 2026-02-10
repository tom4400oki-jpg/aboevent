import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const REFERRAL_COOKIE_NAME = 'referral_code'
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30日

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // リファラルパラメータをCookieに保存 & 訪問記録
    const ref = request.nextUrl.searchParams.get('ref')
    if (ref) {
        if (!request.cookies.get(REFERRAL_COOKIE_NAME)) {
            response.cookies.set(REFERRAL_COOKIE_NAME, ref, {
                path: '/',
                maxAge: REFERRAL_COOKIE_MAX_AGE,
                httpOnly: true,
                sameSite: 'lax',
            })
        }

        // 訪問をSupabase REST APIで記録（非同期・ノンブロッキング）
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (supabaseUrl && serviceKey) {
            fetch(`${supabaseUrl}/rest/v1/referral_visits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': serviceKey,
                    'Authorization': `Bearer ${serviceKey}`,
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify({
                    referrer_id: ref,
                    path: request.nextUrl.pathname,
                }),
            }).catch(() => {
                // 訪問記録の失敗はサイレントに無視
            })
        }
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )

                    // setAllが呼ばれた場合もreferral cookieを保持
                    if (ref && !request.cookies.get(REFERRAL_COOKIE_NAME)) {
                        response.cookies.set(REFERRAL_COOKIE_NAME, ref, {
                            path: '/',
                            maxAge: REFERRAL_COOKIE_MAX_AGE,
                            httpOnly: true,
                            sameSite: 'lax',
                        })
                    }
                },
            },
        }
    )

    // This will refresh session if needed - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user } } = await supabase.auth.getUser()

    return response
}

