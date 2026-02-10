'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    // 環境変数からサイトURLを取得
    // 開発環境(localhost)と本番環境(Netlify)で適切なURLが設定されていることを前提とします
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!siteUrl) {
        console.error('NEXT_PUBLIC_SITE_URL is not set')
        return { error: 'Configuration error: Site URL not set' }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${siteUrl}/auth/callback`,
            queryParams: {
                access_type: 'offline',
            },
        },
    })

    if (error) {
        console.error('Google Sign-in error:', error)
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
}

