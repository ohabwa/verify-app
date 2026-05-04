import './styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify - AI Content Detection',
  description: 'B2B AI content verification platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen bg-neutral-50">
          {children}
        </div>
      </body>
    </html>
  )
}