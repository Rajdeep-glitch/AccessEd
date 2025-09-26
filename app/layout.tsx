import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AIChatbotWidget from "@/components/ai-chatbot-widget"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import PageTransition from "@/components/shared/page"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "DysLexia Learn - Empowering Every Learner",
  description:
    "Comprehensive dyslexia learning platform with AI-powered tools, interactive games, and personalized learning paths.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <PageTransition>
              {children}
            </PageTransition>
            <AIChatbotWidget />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
