import type { Metadata } from 'next'
import { AppProvider } from '@/context/app-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Delivery Weekly Report',
  description: 'Weekly delivery status report viewer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
