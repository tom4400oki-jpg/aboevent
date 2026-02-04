'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isAdmin, canManageEvents } from '@/utils/admin'
import { createAdminClient } from '@/utils/supabase/admin-client'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    // 1. Auth Check
    // 1. Auth Check
    const hasAccess = await canManageEvents()
    if (!hasAccess) {
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

export async function updateEvent(formData: FormData) {
    const supabase = await createClient()

    // 1. Auth Check
    // 1. Auth Check
    const hasAccess = await canManageEvents()
    if (!hasAccess) {
        throw new Error('Unauthorized')
    }

    // 2. Extract Data
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const start_at = formData.get('start_at') as string
    const end_at = formData.get('end_at') as string
    const location = formData.get('location') as string
    const price = formData.get('price') ? parseInt(formData.get('price') as string) : 0
    const capacity = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : 10
    const category = formData.get('category') as string
    const image_url = formData.get('image_url') as string

    // 3. Update
    const { error } = await supabase
        .from('events')
        .update({
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
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/')
    revalidatePath(`/events/${id}`)
    redirect(`/events/${id}`)
}

export async function updateProfile(formData: FormData) {
    // 1. Auth Check (Admin only)
    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
        throw new Error('Unauthorized')
    }

    const supabaseAdmin = createAdminClient()

    // 2. Extract Data
    const id = formData.get('id') as string
    const full_name = formData.get('full_name') as string
    const role = formData.get('role') as string

    // 3. Update (using Admin Client to bypass RLS)
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            full_name: full_name || null,
            role,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/admin/users')
    redirect('/admin/users')
}
