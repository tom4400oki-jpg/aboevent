'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const VIEW_AS_USER_COOKIE = 'view_as_user'
const IMPERSONATE_ID_COOKIE = 'impersonate_id'

export async function impersonateUser(userId: string) {
    const cookieStore = await cookies()

    // Set both cookies
    // 1. Enable preview mode
    cookieStore.set(VIEW_AS_USER_COOKIE, 'true', { path: '/', maxAge: 60 * 60 * 24, sameSite: 'lax' })

    // 2. Set target user ID
    cookieStore.set(IMPERSONATE_ID_COOKIE, userId, { path: '/', maxAge: 60 * 60 * 24, sameSite: 'lax' })

    redirect('/')
}

export async function stopImpersonation() {
    const cookieStore = await cookies()
    cookieStore.set(VIEW_AS_USER_COOKIE, 'false', { path: '/', maxAge: 60 * 60 * 24, sameSite: 'lax' })
    // We can keep the ID or clear it. Let's keep it for history or clear it for clean state?
    // User wants simple swtiching.
    // If we clear it, then next time they toggle "View as User" it goes to dummy.
    // That seems safer.
    cookieStore.delete(IMPERSONATE_ID_COOKIE)

    redirect('/') // or refresh
}
