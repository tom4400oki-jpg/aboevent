import { createAdminClient } from '@/utils/supabase/admin-client'

/**
 * Deletes an image from Supabase Storage given its public URL.
 * Only deletes if the URL belongs to the 'event-images' bucket.
 */
/**
 * Checks if an image URL is still referenced in the database.
 */
async function isImageUrlReferenced(url: string) {
    const supabaseAdmin = createAdminClient()

    // Check events table
    const { count: eventCount } = await supabaseAdmin
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('image_url', url)

    if (eventCount && eventCount > 0) return true

    // Check report_images table
    const { count: reportImageCount } = await supabaseAdmin
        .from('report_images')
        .select('*', { count: 'exact', head: true })
        .eq('image_url', url)

    return (reportImageCount && reportImageCount > 0)
}

/**
 * Deletes an image from Supabase Storage given its public URL.
 * Only deletes if the URL belongs to the 'event-images' bucket
 * and is NOT referenced by any other record in the database.
 */
export async function deleteImageFromUrl(url: string | null | undefined) {
    if (!url) return

    try {
        // Only target our own Supabase storage URLs
        if (!url.includes('/storage/v1/object/public/event-images/')) {
            console.log('Skipping deletion for non-storage URL:', url)
            return
        }

        // Check if still referenced
        const isReferenced = await isImageUrlReferenced(url)
        if (isReferenced) {
            console.log('Skipping deletion as image is still referenced:', url)
            return
        }

        const bucketName = 'event-images'
        const parts = url.split(`${bucketName}/`)
        if (parts.length < 2) return

        const filePath = parts[1]
        const supabaseAdmin = createAdminClient()

        const { error } = await supabaseAdmin.storage
            .from(bucketName)
            .remove([filePath])

        if (error) {
            console.error('Error deleting image from storage:', error)
        } else {
            console.log('Successfully deleted image from storage:', filePath)
        }
    } catch (err) {
        console.error('Failed to parse or delete image URL:', err)
    }
}

/**
 * Deletes multiple images from Supabase Storage given their public URLs.
 * Only deletes images that are NOT referenced by any other record.
 */
export async function deleteImagesFromUrls(urls: (string | null | undefined)[]) {
    if (!urls || urls.length === 0) return

    const bucketName = 'event-images'
    const filePaths: string[] = []

    for (const url of urls) {
        if (!url || !url.includes(`/storage/v1/object/public/${bucketName}/`)) continue

        // Check if still referenced
        const isReferenced = await isImageUrlReferenced(url)
        if (isReferenced) {
            console.log('Skipping deletion as image is still referenced:', url)
            continue
        }

        const parts = url.split(`${bucketName}/`)
        if (parts.length >= 2) {
            filePaths.push(parts[1])
        }
    }

    if (filePaths.length === 0) return

    try {
        const supabaseAdmin = createAdminClient()
        const { error } = await supabaseAdmin.storage
            .from(bucketName)
            .remove(filePaths)

        if (error) {
            console.error('Error deleting images from storage:', error)
        } else {
            console.log('Successfully deleted multiple images from storage:', filePaths.length)
        }
    } catch (err) {
        console.error('Failed to bulk delete images from storage:', err)
    }
}
