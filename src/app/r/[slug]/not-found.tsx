import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="text-6xl mb-4">🍽️</div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Restaurant Not Found</h1>
      <p className="text-gray-500 mb-6">This QR code may have expired or the restaurant is no longer active.</p>
      <Link href="/" className="text-brand-600 font-semibold hover:underline">Go to ScanFlow</Link>
    </div>
  )
}
