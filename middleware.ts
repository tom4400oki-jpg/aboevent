import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // [Auth Debug Log] リクエスト情報をログ出力
    const code = request.nextUrl.searchParams.get('code')
    if (code) {
        console.log('[Auth Debug] code param detected:', {
            pathname,
            fullUrl: request.nextUrl.toString(),
            host: request.headers.get('host'),
            protocol: request.headers.get('x-forwarded-proto'),
        })
    }

    // /auth/callback 以外のパスに ?code= が付いている場合、
    // Supabaseが redirectTo を無視してSite URLにフォールバックした可能性が高いので
    // /auth/callback に転送する
    if (code && pathname !== '/auth/callback') {
        console.log('[Auth Debug] Redirecting code from', pathname, 'to /auth/callback')
        const callbackUrl = new URL('/auth/callback', request.url)
        // 元のURLのクエリパラメータをすべて引き継ぐ
        request.nextUrl.searchParams.forEach((value, key) => {
            callbackUrl.searchParams.set(key, value)
        })
        return NextResponse.redirect(callbackUrl)
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
