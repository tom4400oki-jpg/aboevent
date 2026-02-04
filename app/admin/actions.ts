'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Hardcoded Admin Email (In production, use RLS Policies or Roles properly, but this works for simple checks)
const ADMIN_EMAIL = 'tom4400oki@gmail.com'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
        throw new Error('Unauthorized')
    }

    // 2. Extract Data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const start_at = formData.get('start_at') as string
    const end_at = formData.get('end_at') as string
    const location = formData.get('location') as string
    const price = formData.get('price') ? parseInt(formData.get('price') as string) : 0
    const capacity = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : 10
    const category = formData.get('category') as string
    const image_url = formData.get('image_url') as string

    // 3. Insert
    const { error } = await supabase.from('events').insert({
        title,
        description,
        start_at,
        end_at,
        location,
        price,
        capacity,
        category,
        image_url: image_url || null,
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/')
    redirect('/')
}
