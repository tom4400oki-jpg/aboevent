import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && sessionData?.user) {
            const user = sessionData.user
            const supabaseAdmin = createAdminClient()

            // Googleからのユーザー情報を取得（名前のみ）
            const googleName = user.user_metadata?.full_name || user.user_metadata?.name || null
            const userEmail = user.email

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
                // 新規profile作成
                await supabaseAdmin
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: userEmail,
                        full_name: googleName,
                        role: 'user', // デフォルトロール
                    })
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // エラー時はログインページへリダイレクト
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}


