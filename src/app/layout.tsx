import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export const metadata: Metadata = {
  title: 'March7 Games — Play, share, connect',
  description:
    'The platform where gamers meet, share their creations, and play together.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  )
}
