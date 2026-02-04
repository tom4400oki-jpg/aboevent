export default function Loading() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                <p className="text-gray-500 font-medium animate-pulse">読み込み中...</p>
            </div>
        </div>
    )
}
