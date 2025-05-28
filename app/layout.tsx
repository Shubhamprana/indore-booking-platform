import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth"
import ErrorBoundary from "@/components/error-boundary"
import ClientWrapper from "@/components/client-wrapper"
import NoSSR from "@/components/no-ssr"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BookNow - Multi-Service Booking Platform",
  description: "Skip the wait, book instantly. One app for restaurants, salons, clinics, hotels & more.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientWrapper>
          <ThemeProvider>
          <ErrorBoundary>
              <AuthProvider>
                {children}
                <NoSSR>
                <Toaster />
                </NoSSR>
              </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
        </ClientWrapper>
      </body>
    </html>
  )
}
