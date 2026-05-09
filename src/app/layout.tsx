import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'ScanFlow — Smart QR Review Platform for Restaurants',
  description: 'Turn every QR scan into a 5-star Google review. Smart menus, AI review generation, and reputation management for restaurants.',
  keywords: 'restaurant QR code, google reviews, menu QR, restaurant reviews, feedback management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
