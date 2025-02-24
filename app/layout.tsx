import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from "@/lib/auth"

export const metadata: Metadata = {
  title: 'TrackKar',
  description: 'Track your vehicle',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
