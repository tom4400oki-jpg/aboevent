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

    // リファラルパラメータをCookieに保存
    const ref = request.nextUrl.searchParams.get('ref')
    if (ref && !request.cookies.get(REFERRAL_COOKIE_NAME)) {
        response.cookies.set(REFERRAL_COOKIE_NAME, ref, {
            path: '/',
            maxAge: REFERRAL_COOKIE_MAX_AGE,
            httpOnly: true,
            sameSite: 'lax',
        })
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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // セッションリフレッシュ（Server Componentsに必須）
    await supabase.auth.getUser()

    return response
}
