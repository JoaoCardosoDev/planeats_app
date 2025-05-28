import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PlanEats - Gerencie seus alimentos e descubra receitas",
  description: "Gerencie os ingredientes da sua geladeira e descubra receitas deliciosas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
