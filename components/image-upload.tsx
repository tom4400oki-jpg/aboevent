'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import imageCompression from 'browser-image-compression'

interface ImageUploadProps {
    defaultValue?: string
    name: string
}

export default function ImageUpload({ defaultValue = '', name }: ImageUploadProps) {
    const [imageUrl, setImageUrl] = useState(defaultValue)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError(null)

        try {
            // Compress image before upload (Target: ~100KB)
            const options = {
                maxSizeMB: 0.1, // 100KB
                maxWidthOrHeight: 1280,
                useWebWorker: true,
                onProgress: (progress: number) => {
                    console.log('Compression progress:', progress)
                }
            }

            const compressedFile = await imageCompression(file, options)
            console.log(`Original size: ${(file.size / 1024).toFixed(2)} KB`)
            console.log(`Compressed size: ${(compressedFile.size / 1024).toFixed(2)} KB`)

            const supabase = createClient()

            // Create a unique file name
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
            const filePath = `events/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from('event-images')
                .upload(filePath, compressedFile)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('event-images')
                .getPublicUrl(filePath)

            setImageUrl(publicUrl)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || '画像のアップロードに失敗しました')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">イベント画像</label>

            {/* Preview */}
            <div className="relative aspect-video w-48 mx-auto rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center group">
                {imageUrl ? (
                    <>
                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                        <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                            title="画像を削除"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                        <span className="text-2xl mb-1">🖼️</span>
                        <span className="text-[10px]">No image</span>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-xs font-bold text-indigo-600">アップロード中...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Row */}
            <div className="flex gap-4 items-start">
                <div className="flex-1">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={isUploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50"
                    />
                    {error && <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>}
                </div>
                <div className="flex-1">
                    <input
                        type="url"
                        name={name}
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="または画像のURLを直接入力"
                        className="w-full text-sm border-gray-300 rounded-md p-2 border"
                    />
                </div>
            </div>
            <p className="text-[10px] text-gray-500">※ファイルをアップロードすると、自動的にURLが入力されます。</p>
        </div>
    )
}
