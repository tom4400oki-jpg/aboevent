'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
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

    // Cookieから紹介コードを取得
    const cookieStore = await cookies()
    const referralCode = cookieStore.get('referral_code')?.value

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                referral_code: referralCode, // ユーザーメタデータに保存
            },
        },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        console.error('Signup Error:', error)
        if (error.message === 'User already registered') {
            return { error: 'このメールアドレスは既に登録されています。過去にゲスト予約などを利用された場合は、ログイン画面の「パスワードをお忘れの方」からパスワードを設定してください。' }
        }
        return { error: error.message }
    }

    // 紹介コードがあり、かつ自動確認でない場合（手動確認が必要な場合）、
    // ここでプロフィールを作成する必要があるかもしれないが、
    // 基本的には auth.users のトリガーか、ログイン後の処理（callback）に任せるのが安全。
    // ただし、即時ログインされる設定の場合はここでプロフィールを作る必要がある。

    // 今回はメタデータに入れたので、トリガーやCallbackで `raw_user_meta_data->>referral_code` を参照できる。

    revalidatePath('/', 'layout')
    redirect('/')
}
