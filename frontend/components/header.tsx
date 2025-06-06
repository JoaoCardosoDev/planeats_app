"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Settings, User, LogOut } from "lucide-react"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"

export default function Header() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
    toast.success("Logout realizado com sucesso!")
  }

  // Evitar problemas de hidratação
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/placeholder-logo.png" alt="PlanEats Logo" width={32} height={32} className="rounded-full" />
            <span className="text-xl font-bold text-green-700">
              Plan<span className="text-amber-500">Eats</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-green-100 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    )
  }
   return (
    <header className="sticky top-0 z-50 w-full border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-green-50">
                <Menu className="h-5 w-5 text-green-700" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] border-green-200">
              <nav className="flex flex-col gap-4 mt-8">
                {session?.user ? (
                  <>
                  <Link
                      href="/meu-frigorifico"
                      className="text-lg font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50"
                    >
                      Meu Frigorífico
                    </Link>
                    <Link
                      href="/adicionar-itens"
                      className="text-lg font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50"
                    >
                      Adicionar Itens
                    </Link>
                    <Link
                      href="/receitas-sugeridas"
                      className="text-lg font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50"
                    >
                      Receitas Sugeridas
                    </Link>
                    <Link
                      href="/minhas-receitas"
                      className="text-lg font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50"
                    >
                      Minhas Receitas
                    </Link>
                    <Link href="/explorar" className="text-lg font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50">
                      Explorar
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-lg font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50">
                      Entrar
                    </Link>
                    <Link href="/cadastro" className="text-lg font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50">
                      Cadastrar
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/placeholder-logo.png" alt="PlanEats Logo" width={32} height={32} className="rounded-full" />
            <span className="text-xl font-bold text-green-700">
              Plan<span className="text-amber-500">Eats</span>
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {session?.user ? (
            <>
              <Link href="/meu-frigorifico" className="text-sm font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50">
                Meu Frigorífico
              </Link>
              <Link href="/adicionar-itens" className="text-sm font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50">
                Adicionar Itens
              </Link>
              <Link href="/receitas-sugeridas" className="text-sm font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50">
                Receitas Sugeridas
              </Link>
               <Link href="/minhas-receitas" className="text-sm font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50">
                Minhas Receitas
              </Link>
              <Link href="/explorar" className="text-sm font-medium text-green-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50">
                Explorar
              </Link>
            </>
          ) : null}
        </nav>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-green-50">
                  <Avatar className="h-8 w-8 border-2 border-green-200">
                    <AvatarImage src={session.user.image || "/placeholder.svg?height=32&width=32"} alt="Foto de perfil" />
                    <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                      {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-green-200">
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="cursor-pointer flex items-center text-green-700 hover:text-green-600 hover:bg-green-50">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes" className="cursor-pointer flex items-center text-green-700 hover:text-green-600 hover:bg-green-50">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-green-200" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
              ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="text-green-700 hover:text-green-600 hover:bg-green-50">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                <Link href="/cadastro">Cadastrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}