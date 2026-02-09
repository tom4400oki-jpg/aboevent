'use client'

import { useState } from 'react'

interface EventLocationFieldsProps {
    initialLocation?: string
    initialAddress?: string
    initialNearestStation?: string
}

export default function EventLocationFields({
    initialLocation = '',
    initialAddress = '',
    initialNearestStation = '',
}: EventLocationFieldsProps) {
    const [location, setLocation] = useState(initialLocation)
    const [address, setAddress] = useState(initialAddress)
    const [nearestStation, setNearestStation] = useState(initialNearestStation)

    return (
        <div className="space-y-4">
            {/* 場所（施設名） */}
            <div>
                <label className="block text-sm font-bold text-gray-700">場所（施設名）</label>
                <input
                    type="text"
                    name="location"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="例: 戸塚スポーツセンター"
                    className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 住所 */}
                <div>
                    <label className="block text-sm font-bold text-gray-700">住所</label>
                    <input
                        type="text"
                        name="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="例: 神奈川県横浜市戸塚区上倉田町477"
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
                    />
                </div>

                {/* 最寄り駅 */}
                <div>
                    <label className="block text-sm font-bold text-gray-700">最寄り駅</label>
                    <input
                        type="text"
                        name="nearest_station"
                        value={nearestStation}
                        onChange={(e) => setNearestStation(e.target.value)}
                        placeholder="例: 戸塚駅"
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 text-sm"
                    />
                </div>
            </div>
        </div>
    )
}


