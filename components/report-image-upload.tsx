'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import imageCompression from 'browser-image-compression'

interface ReportImageUploadProps {
    defaultImages?: string[]
}

export default function ReportImageUpload({ defaultImages = [] }: ReportImageUploadProps) {
    const [images, setImages] = useState<string[]>(defaultImages)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        setError(null)

        try {
            const supabase = createClient()
            const newImageUrls: string[] = [...images]

            for (let i = 0; i < files.length; i++) {
                const file = files[i]

                // Compress image (Target: ~100KB)
                const options = {
                    maxSizeMB: 0.1,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true,
                }
                const compressedFile = await imageCompression(file, options)

                // Create a unique file name
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
                const filePath = `reports/${fileName}`

                // Upload
                const { error: uploadError } = await supabase.storage
                    .from('event-images')
                    .upload(filePath, compressedFile)

                if (uploadError) throw uploadError

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('event-images')
                    .getPublicUrl(filePath)

                newImageUrls.push(publicUrl)
            }

            setImages(newImageUrls)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || '画像のアップロードに失敗しました')
        } finally {
            setIsUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">レポート写真 (複数可)</label>

            {/* Hidden inputs for form submission */}
            {images.map((url, index) => (
                <input key={index} type="hidden" name="image_urls" value={url} />
            ))}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg border border-gray-200 bg-gray-50 overflow-hidden group shadow-sm">
                        <img src={url} alt={`Upload ${index}`} className="h-full w-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                            title="削除"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}

                <label className={`relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        disabled={isUploading}
                        className="hidden"
                    />
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-1"></div>
                            <span className="text-[10px] text-indigo-600 font-bold">保存中...</span>
                        </div>
                    ) : (
                        <>
                            <span className="text-2xl text-gray-400">📸</span>
                            <span className="text-[10px] font-bold text-gray-500 mt-1">追加する</span>
                        </>
                    )}
                </label>
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            <p className="text-[10px] text-gray-400">※写真は自動的に100KB前後に圧縮されます。</p>
        </div>
    )
}
