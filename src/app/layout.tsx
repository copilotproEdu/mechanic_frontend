import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SessionTimeoutGuard from '@/components/SessionTimeoutGuard'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  title: 'AutoShop Pro - Management System',
  description: 'Car Repair Management System for AutoShop Pro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionTimeoutGuard>{children}</SessionTimeoutGuard>
      </body>
    </html>
  )
}
