'use client'

import dynamic from 'next/dynamic'

const EventMap = dynamic(() => import('./event-map'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl" />
})

interface EventMarker {
    id: string
    title: string
    latitude: number
    longitude: number
    category?: string
}

interface EventMapWrapperProps {
    events: EventMarker[]
    center?: [number, number]
    zoom?: number
}

export default function EventMapWrapper(props: EventMapWrapperProps) {
    return <EventMap {...props} />
}
