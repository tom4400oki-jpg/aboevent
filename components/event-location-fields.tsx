'use client'

import { useState } from 'react'
import { geocodeAddress } from '@/app/admin/actions'

interface EventLocationFieldsProps {
    initialLocation?: string
    initialNearestStation?: string
    initialLatitude?: number | null
    initialLongitude?: number | null
}

export default function EventLocationFields({
    initialLocation = '',
    initialNearestStation = '',
    initialLatitude = null,
    initialLongitude = null
}: EventLocationFieldsProps) {
    const [location, setLocation] = useState(initialLocation)
    const [nearestStation, setNearestStation] = useState(initialNearestStation)
    const [latitude, setLatitude] = useState<string>(initialLatitude?.toString() || '')
    const [longitude, setLongitude] = useState<string>(initialLongitude?.toString() || '')
    const [isGeocoding, setIsGeocoding] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGeocode = async (targetLocation: string) => {
        if (!targetLocation || targetLocation === initialLocation) return

        setIsGeocoding(true)
        setError(null)
        try {
            const coords = await geocodeAddress(targetLocation)
            if (coords) {
                setLatitude(coords.latitude.toString())
                setLongitude(coords.longitude.toString())
            } else {
                setError('住所から座標を自動取得できませんでした。正確な住所を入力してください。')
            }
        } catch (err) {
            setError('座標の取得中にエラーが発生しました。')
        } finally {
            setIsGeocoding(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">場所 / 住所</label>
                    <div className="mt-1 relative">
                        <input
                            type="text"
                            name="location"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onBlur={() => handleGeocode(location)}
                            placeholder="例: 東京都渋谷区神南1-23-10"
                            className="block w-full rounded-md border-gray-300 border p-2 text-sm pr-20"
                        />
                        {isGeocoding && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 animate-pulse">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                                座標取得中...
                            </div>
                        )}
                    </div>
                    {error && <p className="text-red-500 text-[10px] mt-1 font-bold">{error}</p>}
                    {!error && !isGeocoding && latitude && (
                        <p className="text-green-600 text-[10px] mt-1 font-bold flex items-center gap-1">
                            <span>📍</span> 座標を取得しました
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">最寄り駅</label>
                    <input
                        type="text"
                        name="nearest_station"
                        value={nearestStation}
                        onChange={(e) => setNearestStation(e.target.value)}
                        placeholder="例: 渋谷駅"
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
                    />
                </div>
            </div>

            {/* Hidden Coordinates */}
            <input type="hidden" name="latitude" value={latitude} />
            <input type="hidden" name="longitude" value={longitude} />
        </div>
    )
}
