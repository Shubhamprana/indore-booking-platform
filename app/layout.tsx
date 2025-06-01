import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth"
import ErrorBoundary from "@/components/error-boundary"
import { AuthErrorHandler } from "@/components/auth-error-handler"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FastBookr - Multi-Service Booking Platform",
  description: "Skip the wait, book instantly. One app for restaurants, salons, clinics, hotels & more.",
  generator: 'v0.dev',
  icons: {
    icon: [
      {
        url: '/logo-without-name.png',
        type: 'image/png',
      }
    ],
    shortcut: '/logo-without-name.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-without-name.png" type="image/png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster />
            <AuthErrorHandler />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
