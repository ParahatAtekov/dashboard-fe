import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HyperLiquid Analytics | Dashboard',
  description: 'Internal analytics dashboard for HyperLiquid-based DeFi platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}
