import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Layout from "@/components/layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FeelFlow - Track Your Emotional Journey",
  description:
    "A mindful approach to emotional wellness. Track moods, discover patterns, and nurture your mental health with AI-powered insights.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <Layout>{children}</Layout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
