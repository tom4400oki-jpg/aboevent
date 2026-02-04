'use client'

import { useState } from 'react'
import Image from 'next/image'

// Mock data for the gallery - in a real app, this would come from the database
const MOCK_IMAGES = [
    'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80', // Futsal action
    'https://images.unsplash.com/photo-1626244422230-0d12e6988f62?auto=format&fit=crop&q=80', // Tennis action
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80', // Sports high five
    'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80', // Happy team
]

export default function EventGallery() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    return (
        <section className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>📸</span>
                <span>ギャラリー</span>
                <span className="text-sm font-normal text-gray-500 ml-2">過去の開催風景</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MOCK_IMAGES.map((src, index) => (
                    <div
                        key={index}
                        className="relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 border-transparent hover:border-indigo-500 transition-all hover:scale-105 group"
                        onClick={() => setSelectedImage(src)}
                    >
                        <img
                            src={src}
                            alt={`Gallery image ${index + 1}`}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
                        <img
                            src={selectedImage}
                            alt="Enlarged gallery view"
                            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
                        />
                        <button
                            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}
