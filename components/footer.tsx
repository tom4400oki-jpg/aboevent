export default function Footer() {
    return (
        <footer className="border-t border-gray-100 bg-white py-8 mt-auto">
            <div className="mx-auto flex max-w-5xl items-center justify-center px-4 text-center sm:px-6 lg:px-8">
                <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} Funny-Spo. 全ての権利を保有しています。
                </p>
            </div>
        </footer>
    )
}
