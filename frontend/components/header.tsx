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
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoggedIn = !!session


  // Detectar scroll para mudar o estilo da navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 100) // Aumentei para 100px para dar mais espaço
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
    toast.success("Logout realizado com sucesso!")
  }

  // Determinar se estamos na página inicial
  const isHomePage = pathname === "/"

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-700 ease-out ${
        isHomePage
          ? isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20"
            : "bg-transparent"
          : "bg-white/95 backdrop-blur-md border-b shadow-sm"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`md:hidden transition-colors duration-500 ${
                  isHomePage && !isScrolled ? "text-white hover:bg-white/20" : "hover:bg-gray-100"
                }`}
              >
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
          <Link href="/" className="flex items-center group">
            <Image
              src="/images/Logo.png"
              alt="PlanEats Logo"
              width={50}
              height={50}
              className="rounded-full transition-transform duration-300 group-hover:scale-110"
            />
            <span
                className={`text-xl font-bold transition-colors duration-500 ${
                  isHomePage && !isScrolled ? "text-white" : "text-green-600"
                }`}
                style={{
                  height: "20px",
                }}
              >
                  Plan<span className="text-amber-500">Eats</span>
                </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <Link
                href="/meu-frigorifico"
                className={`text-sm font-medium transition-colors duration-500 ${
                  isHomePage && !isScrolled ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-green-600"
                }`}
              >
                Meu Frigorífico
              </Link>
              <Link
                href="/adicionar-itens"
                className={`text-sm font-medium transition-colors duration-500 ${
                  isHomePage && !isScrolled ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-green-600"
                }`}
              >
                Adicionar Itens
              </Link>
              <Link
                href="/receitas-sugeridas"
                className={`text-sm font-medium transition-colors duration-500 ${
                  isHomePage && !isScrolled ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-green-600"
                }`}
              >
                Receitas Sugeridas
              </Link>
              <Link
                href="/minhas-receitas"
                className={`text-sm font-medium transition-colors duration-500 ${
                  isHomePage && !isScrolled ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-green-600"
                }`}
              >
                Minhas Receitas
              </Link>
              <Link
                href="/explorar"
                className={`text-sm font-medium transition-colors duration-500 ${
                  isHomePage && !isScrolled ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-green-600"
                }`}
              >
                Explorar
              </Link>
            </>
          ) : null}
        </nav>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full transition-colors duration-500 ${
                    isHomePage && !isScrolled ? "hover:bg-white/20" : "hover:bg-gray-100"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || "/placeholder.svg?height=32&width=32"} alt="Foto de perfil" />
                    <AvatarFallback>{session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}</AvatarFallback>
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
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className={`transition-colors duration-500 ${
                  isHomePage && !isScrolled
                    ? "text-white/90 hover:text-white hover:bg-white/20"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Link href="/login">Entrar</Link>
              </Button>
              <Button
                asChild
                className={`transition-all duration-500 ${
                  isHomePage && !isScrolled
                    ? "bg-green-600/90 hover:bg-green-700 text-white border border-green-500/30 backdrop-blur-sm"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <Link href="/cadastro">Cadastrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
