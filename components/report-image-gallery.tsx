'use client'

import { useState } from 'react'

interface ReportImageGalleryProps {
    images: { image_url: string }[]
    title: string
}

export default function ReportImageGallery({ images, title }: ReportImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    if (!images || images.length === 0) return null

    return (
        <div className="mb-12 grid gap-4">
            {/* Main Image */}
            <div
                className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50 aspect-video cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => setSelectedImage(images[0].image_url)}
            >
                <img
                    src={images[0].image_url}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Sub Images */}
            {images.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.slice(1).map((img, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl overflow-hidden shadow-lg aspect-square bg-gray-50 border border-gray-100 cursor-pointer group"
                            onClick={() => setSelectedImage(img.image_url)}
                        >
                            <img
                                src={img.image_url}
                                alt={`${title} - ${idx + 2}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
                        <img
                            src={selectedImage}
                            alt="Enlarged view"
                            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
                        />
                        <button
                            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
