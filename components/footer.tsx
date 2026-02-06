export default function Footer() {
    return (
        <footer className="border-t border-gray-100 bg-white py-8 mt-auto">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 lg:px-8">
                <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} Funny-Spo. All rights reserved.
                </p>
                <div className="flex gap-4">
                    <span className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer">Privacy Policy</span>
                    <span className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer">Terms of Service</span>
                </div>
            </div>
        </footer>
    )
}
