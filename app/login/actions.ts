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
        console.error('Signup Error:', error)
        if (error.message === 'User already registered') {
            return { error: 'このメールアドレスは既に登録されています。過去にゲスト予約などを利用された場合は、ログイン画面の「パスワードをお忘れの方」からパスワードを設定してください。' }
        }
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
