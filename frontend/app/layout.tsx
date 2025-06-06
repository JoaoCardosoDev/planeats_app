import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { Toaster } from "sonner"
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PlanEats - Gerencie seus alimentos e descubra receitas",
  description: "Gerencie os ingredientes da sua geladeira e descubra receitas deliciosas",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProviderWrapper>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="light" 
            enableSystem={false} 
            disableTransitionOnChange
            forcedTheme="light"
          >
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">{children}</main>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
