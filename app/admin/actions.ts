'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isAdmin, canManageEvents } from '@/utils/admin'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { ensureJSTOffset } from '@/utils/date'
import { deleteImageFromUrl, deleteImagesFromUrls } from '@/utils/storage'

export async function createEvent(formData: FormData) {
    const supabaseAdmin = createAdminClient()

    // 1. Auth Check
    const hasAccess = await canManageEvents()
    if (!hasAccess) {
        throw new Error('Unauthorized')
    }

    // 2. Extract Data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const event_date = formData.get('event_date') as string
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string

    // Combine date and time with JST offset
    const start_at = `${event_date}T${start_time}:00+09:00`
    const end_at = `${event_date}T${end_time}:00+09:00`

    const location = formData.get('location') as string
    const price = formData.get('price') ? parseInt(formData.get('price') as string) : 0
    const capacity = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : 10
    const category = formData.get('category') as string
    const image_url = formData.get('image_url') as string
    const nearest_station = formData.get('nearest_station') as string
    const ask_transportation = formData.get('ask_transportation') === 'on'
    const transportation_info = formData.get('transportation_info') as string
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const min_role = formData.get('min_role') as string || 'user'

    // 3. Insert
    const { error } = await supabaseAdmin.from('events').insert({
        title,
        description,
        start_at,
        end_at,
        location,
        price,
        capacity,
        category,
        image_url: image_url || null,
        nearest_station,
        ask_transportation,
        transportation_info,
        latitude,
        longitude,
        min_role,
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/')
    redirect('/')
}

export async function updateEvent(formData: FormData) {
    const supabaseAdmin = createAdminClient()

    // 1. Auth Check
    const hasAccess = await canManageEvents()
    if (!hasAccess) {
        throw new Error('Unauthorized')
    }

    // 2. Extract Data
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const event_date = formData.get('event_date') as string
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string

    // Combine date and time with JST offset
    const start_at = `${event_date}T${start_time}:00+09:00`
    const end_at = `${event_date}T${end_time}:00+09:00`

    const location = formData.get('location') as string
    const price = formData.get('price') ? parseInt(formData.get('price') as string) : 0
    const capacity = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : 10
    const category = formData.get('category') as string
    const image_url = formData.get('image_url') as string
    const nearest_station = formData.get('nearest_station') as string
    const ask_transportation = formData.get('ask_transportation') === 'on'
    const transportation_info = formData.get('transportation_info') as string
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const min_role = formData.get('min_role') as string || 'user'

    // 2.5 Get old image for cleanup
    const { data: oldEvent } = await supabaseAdmin
        .from('events')
        .select('image_url')
        .eq('id', id)
        .single()

    const oldImageUrl = oldEvent?.image_url

    // 3. Update
    const { error } = await supabaseAdmin
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
            nearest_station,
            ask_transportation,
            transportation_info,
            latitude,
            longitude,
            min_role,
        })
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    // 4. Cleanup old image if changed
    if (oldImageUrl && oldImageUrl !== image_url) {
        await deleteImageFromUrl(oldImageUrl)
    }

    revalidatePath('/')
    revalidatePath(`/events/${id}`)
    redirect(`/events/${id}`)
}

export async function deleteEvent(id: string) {
    const supabaseAdmin = createAdminClient()

    // 1. Auth Check
    const hasAccess = await canManageEvents()
    if (!hasAccess) {
        throw new Error('Unauthorized')
    }

    // 1.5 Get image URL for cleanup
    const { data: event } = await supabaseAdmin
        .from('events')
        .select('image_url')
        .eq('id', id)
        .single()

    // 1.6 Get report images for cleanup
    const { data: reportImages } = await supabaseAdmin
        .from('event_reports')
        .select(`
            id,
            report_images (image_url)
        `)
        .eq('event_id', id)

    // 2. Delete Event (Cascade will handle record deletion for most things)
    // We also delete reports tied to this event to keep DB clean
    await supabaseAdmin
        .from('event_reports')
        .delete()
        .eq('event_id', id)

    const { error } = await supabaseAdmin
        .from('events')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    // 3. Cleanup storage
    const allImagesToDelete: string[] = []

    // 3.1 Main event image
    if (event?.image_url) {
        allImagesToDelete.push(event.image_url)
    }

    // 3.2 Gallery/Report images
    if (reportImages) {
        for (const report of reportImages) {
            if (report.report_images) {
                for (const img of report.report_images as any[]) {
                    allImagesToDelete.push(img.image_url)
                }
            }
        }
    }

    if (allImagesToDelete.length > 0) {
        await deleteImagesFromUrls(allImagesToDelete)
    }

    revalidatePath('/')
    revalidatePath('/reports')
    redirect('/')
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

export async function createReport(formData: FormData) {
    const supabaseAdmin = createAdminClient()
    const hasAccess = await canManageEvents()
    if (!hasAccess) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not found')

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const event_id = formData.get('event_id') as string || null
    const imageUrls = formData.getAll('image_urls') as string[]

    // 1. Insert Report
    const { data: report, error: reportError } = await supabaseAdmin
        .from('event_reports')
        .insert({
            title,
            content,
            event_id,
            user_id: user.id
        })
        .select()
        .single()

    if (reportError) throw new Error(reportError.message)

    // 2. Insert Images if any
    if (imageUrls.length > 0) {
        const imageData = imageUrls
            .filter(url => url.trim() !== '')
            .map(url => ({
                report_id: report.id,
                image_url: url
            }))

        if (imageData.length > 0) {
            const { error: imageError } = await supabaseAdmin
                .from('report_images')
                .insert(imageData)
            if (imageError) throw new Error(imageError.message)
        }
    }

    revalidatePath('/')
    revalidatePath('/reports')
    if (event_id) revalidatePath(`/events/${event_id}`)
    redirect('/admin/reports')
}

export async function updateReport(formData: FormData) {
    const supabaseAdmin = createAdminClient()
    const hasAccess = await canManageEvents()
    if (!hasAccess) throw new Error('Unauthorized')

    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const event_id = formData.get('event_id') as string || null
    const imageUrls = formData.getAll('image_urls') as string[]

    // 1. Get old images for cleanup
    const { data: oldImages } = await supabaseAdmin
        .from('report_images')
        .select('image_url')
        .eq('report_id', id)

    // 2. Update Report
    const { error: reportError } = await supabaseAdmin
        .from('event_reports')
        .update({ title, content, event_id })
        .eq('id', id)

    if (reportError) throw new Error(reportError.message)

    // 3. Update Images (Delete all and re-insert for simplicity in multi-upload)
    const { error: deleteError } = await supabaseAdmin
        .from('report_images')
        .delete()
        .eq('report_id', id)

    if (deleteError) throw new Error(deleteError.message)

    if (imageUrls.length > 0) {
        const imageData = imageUrls
            .filter(url => url.trim() !== '')
            .map(url => ({
                report_id: id,
                image_url: url
            }))

        if (imageData.length > 0) {
            const { error: imageError } = await supabaseAdmin
                .from('report_images')
                .insert(imageData)
            if (imageError) throw new Error(imageError.message)
        }
    }

    // 4. Cleanup storage (find images that are no longer used)
    const newImageUrls = new Set(imageUrls)
    if (oldImages) {
        const imagesToCleanup = oldImages
            .map(old => old.image_url)
            .filter(url => !newImageUrls.has(url))

        if (imagesToCleanup.length > 0) {
            await deleteImagesFromUrls(imagesToCleanup)
        }
    }

    revalidatePath('/')
    revalidatePath('/reports')
    revalidatePath(`/reports/${id}`)
    if (event_id) revalidatePath(`/events/${event_id}`)
    redirect('/admin/reports')
}

export async function deleteReport(id: string) {
    const supabaseAdmin = createAdminClient()
    const hasAccess = await canManageEvents()
    if (!hasAccess) throw new Error('Unauthorized')

    // 1. Get images for storage cleanup
    const { data: images } = await supabaseAdmin
        .from('report_images')
        .select('image_url')
        .eq('report_id', id)

    // 2. Delete Report
    const { error } = await supabaseAdmin
        .from('event_reports')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)

    // 3. Cleanup storage
    if (images && images.length > 0) {
        await deleteImagesFromUrls(images.map(img => img.image_url))
    }

    revalidatePath('/')
    revalidatePath('/reports')
    redirect('/admin/reports')
}

export async function geocodeAddress(address: string) {
    if (!address) return null

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'funny-spo-admin-app'
            }
        })
        const data = await response.json()

        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
            }
        }
    } catch (error) {
        console.error('Geocoding error:', error)
    }
    return null
}
