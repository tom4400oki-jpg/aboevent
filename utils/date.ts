/**
 * Event date formatting utilities (Enforced JST - Asia/Tokyo)
 */

const JST_TIMEZONE = 'Asia/Tokyo'

/**
 * Formats a date string into a localized Japanese date with weekday.
 * e.g., "2026年2月6日(金)"
 */
export function formatEventDate(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', {
        timeZone: JST_TIMEZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    })
}

/**
 * Formats a date string into a localized Japanese time.
 * e.g., "10:00"
 */
export function formatEventTime(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ja-JP', {
        timeZone: JST_TIMEZONE,
        hour: 'numeric',
        minute: '2-digit',
    })
}

/**
 * Formats a date string into a compact localized Japanese date/time.
 * e.g., "2/6(金) 10:00"
 */
export function formatEventDateTimeCompact(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)

    // Custom format since toLocaleDateString might not give exactly what we want in all environments
    const formatter = new Intl.DateTimeFormat('ja-JP', {
        timeZone: JST_TIMEZONE,
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
    })

    return formatter.format(date)
}

/**
 * Formats a date for HTML datetime-local input (YYYY-MM-DDThh:mm)
 * This avoids the timezone shift issue by explicitly extracting JST components.
 */
export function formatForDateTimeLocal(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)

    const formatter = new Intl.DateTimeFormat('ja-JP', {
        timeZone: JST_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })

    const parts = formatter.formatToParts(date)
    const p: Record<string, string> = {}
    parts.forEach(part => {
        p[part.type] = part.value
    })

    // Some environments might return '24' for hour 0, normalize it if necessary
    let hour = p.hour
    if (hour === '24') hour = '00'

    return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}`
}

/**
 * Ensures a date string from a datetime-local input has the JST offset (+09:00)
 * to prevent the database from interpreting it as UTC or another timezone.
 */
export function ensureJSTOffset(dateTimeStr: string): string {
    if (!dateTimeStr) return dateTimeStr
    // If it already has an offset or is UTC, return as is
    if (dateTimeStr.includes('+') || dateTimeStr.endsWith('Z')) return dateTimeStr
    // Append JST offset (+09:00)
    return `${dateTimeStr}:00+09:00`
}

/**
 * Formats a start and end time into a range string.
 * e.g., "10:00 〜 12:00"
 */
export function formatEventTimeRange(startStr: string, endStr: string): string {
    const startTime = formatEventTime(startStr)
    const endTime = formatEventTime(endStr)
    if (!startTime) return ''
    if (!endTime) return startTime
    return `${startTime} 〜 ${endTime}`
}

/**
 * Returns a date string for input type="date" (YYYY-MM-DD) in JST
 */
export function formatToDateValue(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const formatter = new Intl.DateTimeFormat('ja-JP', {
        timeZone: JST_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
    const parts = formatter.formatToParts(date)
    const p: Record<string, string> = {}
    parts.forEach(part => { p[part.type] = part.value })
    return `${p.year}-${p.month}-${p.day}`
}

/**
 * Returns a time string for input type="time" (HH:mm) in JST
 */
export function formatToTimeValue(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const formatter = new Intl.DateTimeFormat('ja-JP', {
        timeZone: JST_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
    const parts = formatter.formatToParts(date)
    const p: Record<string, string> = {}
    parts.forEach(part => { p[part.type] = part.value })

    let hour = p.hour
    if (hour === '24') hour = '00'
    return `${hour}:${p.minute}`
}
