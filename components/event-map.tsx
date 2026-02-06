'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface EventMarker {
    id: string
    title: string
    latitude: number
    longitude: number
    category?: string
}

interface EventMapProps {
    events: EventMarker[]
    center?: [number, number]
    zoom?: number
}

export default function EventMap({ events, center = [35.43, 139.54], zoom = 12 }: EventMapProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl" />

    const validEvents = events.filter(e => typeof e.latitude === 'number' && typeof e.longitude === 'number')

    // Group events by location to handle overlaps
    const groupedEvents = validEvents.reduce((acc, event) => {
        const key = `${event.latitude},${event.longitude}`
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(event)
        return acc
    }, {} as Record<string, EventMarker[]>)

    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                zoomControl={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {Object.entries(groupedEvents).map(([key, eventsAtLocation]) => {
                    const [lat, lng] = key.split(',').map(Number)
                    return (
                        <Marker key={key} position={[lat, lng]}>
                            <Popup>
                                <div className="p-1 min-w-[150px] max-h-[200px] overflow-y-auto">
                                    {eventsAtLocation.length > 1 && (
                                        <p className="text-[10px] font-bold text-gray-400 mb-2 border-b pb-1">
                                            {eventsAtLocation.length}件のイベント
                                        </p>
                                    )}
                                    <div className="space-y-3">
                                        {eventsAtLocation.map((event, idx) => (
                                            <div key={event.id} className={idx > 0 ? "pt-2 border-t border-gray-100" : ""}>
                                                <p className="font-bold text-sm mb-1">{event.title}</p>
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    className="text-xs font-bold text-indigo-600 hover:underline inline-block"
                                                >
                                                    詳細を表示
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        </div>
    )
}
