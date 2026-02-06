'use client'

import React from 'react'

interface TimeSelectProps {
    name: string
    defaultValue?: string
    required?: boolean
}

export default function TimeSelect({ name, defaultValue = "10:00", required }: TimeSelectProps) {
    // Generate times from 00:00 to 23:30 in 30-minute intervals
    const times = []
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hour = h.toString().padStart(2, '0')
            const minute = m.toString().padStart(2, '0')
            times.push(`${hour}:${minute}`)
        }
    }

    return (
        <select
            name={name}
            required={required}
            defaultValue={defaultValue}
            className="mt-1 block w-full rounded-md border-gray-300 border p-2 bg-white"
        >
            {times.map(t => (
                <option key={t} value={t}>{t}</option>
            ))}
        </select>
    )
}
