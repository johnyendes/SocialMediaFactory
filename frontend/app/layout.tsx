import './globals.css'
import { Inter } from 'next/font/google'
import Providers from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Market Intelligence - AI-Powered Investment Analysis',
  description: 'Advanced market intelligence platform with AI-powered scoring, portfolio analysis, and comprehensive reporting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
