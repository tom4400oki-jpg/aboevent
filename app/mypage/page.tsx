import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './profile-form'

export default async function MyPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, email')
        .eq('id', user.id)
        .single()

    return (
        <main className="mx-auto max-w-2xl py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">マイページ</h1>
            <div className="bg-white shadow sm:rounded-md sm:overflow-hidden rounded-xl">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">プロフィール設定</h2>
                    <ProfileForm
                        initialFullName={profile?.full_name ?? null}
                        email={profile?.email ?? user.email ?? ''}
                    />
                </div>
            </div>
        </main>
    )
}
