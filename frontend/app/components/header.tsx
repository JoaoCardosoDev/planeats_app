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
import { usePathname } from "next/navigation"

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()

  // Verificar se o usuário está em uma página que requer autenticação
  useEffect(() => {
    // Páginas que não requerem autenticação
    const publicPages = ["/", "/login", "/cadastro"]

    // Se a página atual não estiver na lista de páginas públicas, considerar o usuário como logado
    if (!publicPages.includes(pathname)) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/meu-frigorifico"
                      className="text-lg font-medium hover:text-green-600 transition-colors"
                    >
                      Meu Frigorífico
                    </Link>
                    <Link
                      href="/adicionar-itens"
                      className="text-lg font-medium hover:text-green-600 transition-colors"
                    >
                      Adicionar Itens
                    </Link>
                    <Link
                      href="/receitas-sugeridas"
                      className="text-lg font-medium hover:text-green-600 transition-colors"
                    >
                      Receitas Sugeridas
                    </Link>
                    <Link
                      href="/minhas-receitas"
                      className="text-lg font-medium hover:text-green-600 transition-colors"
                    >
                      Minhas Receitas
                    </Link>
                    <Link href="/explorar" className="text-lg font-medium hover:text-green-600 transition-colors">
                      Explorar
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-lg font-medium hover:text-green-600 transition-colors">
                      Entrar
                    </Link>
                    <Link href="/cadastro" className="text-lg font-medium hover:text-green-600 transition-colors">
                      Cadastrar
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="PlanEats Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-xl font-bold">
              Plan<span className="text-amber-500">Eats</span>
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <Link href="/meu-frigorifico" className="text-sm font-medium hover:text-green-600 transition-colors">
                Meu Frigorífico
              </Link>
              <Link href="/adicionar-itens" className="text-sm font-medium hover:text-green-600 transition-colors">
                Adicionar Itens
              </Link>
              <Link href="/receitas-sugeridas" className="text-sm font-medium hover:text-green-600 transition-colors">
                Receitas Sugeridas
              </Link>
              <Link href="/minhas-receitas" className="text-sm font-medium hover:text-green-600 transition-colors">
                Minhas Receitas
              </Link>
              <Link href="/explorar" className="text-sm font-medium hover:text-green-600 transition-colors">
                Explorar
              </Link>
            </>
          ) : null}
        </nav>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Foto de perfil" />
                    <AvatarFallback>US</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsLoggedIn(false)} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/cadastro">Cadastrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
