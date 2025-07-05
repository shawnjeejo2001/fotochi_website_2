import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
// Import the Providers component
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Fotochi | Book Photographers & Videographers",
  description: "Professional Photography Platform - Connect with top photographers and videographers",
  generator: "v0.dev",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

// Update the RootLayout component to use Providers
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
