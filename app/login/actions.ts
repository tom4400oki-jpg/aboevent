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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const redirectTo = `${siteUrl}/auth/callback`

    console.log('[GoogleLogin] Step1: signInWithOAuth開始', { siteUrl, redirectTo })

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo,
        },
    })

    if (error) {
        console.error('[GoogleLogin] Step1: OAuthエラー', error.message)
        return { error: error.message }
    }

    console.log('[GoogleLogin] Step2: Google認証画面へリダイレクト', { url: data.url })

    if (data.url) {
        redirect(data.url)
    }
}
