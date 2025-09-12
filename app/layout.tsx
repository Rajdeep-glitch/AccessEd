import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AIChatbotWidget from "@/components/ai-chatbot-widget"
import { Suspense } from "react"

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
    <html lang="en">
      <body className={`font-sans ${inter.variable} antialiased`}>
        <Suspense fallback={null}>
          {children}
          <AIChatbotWidget />
        </Suspense>
      </body>
    </html>
  )
}
