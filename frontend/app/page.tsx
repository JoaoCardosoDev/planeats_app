"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, ChefHat, ClipboardList, Clock, Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container grid gap-6 md:grid-cols-2 md:gap-12 items-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-green-600">PLAN</span> SMARTER, <span className="text-amber-500">EAT</span> BETTER.
            </h1>
            <p className="text-lg text-muted-foreground">
              Descubra receitas deliciosas baseadas nos ingredientes que você já tem em casa. Economize tempo, dinheiro
              e reduza o desperdício de alimentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                <Link href="/cadastro">Criar Conta Grátis</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Entrar</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Frigorífico organizado com alimentos frescos"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="py-16 bg-green-50">
        <div className="container flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Como Funciona</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Três passos simples para transformar os ingredientes da sua geladeira em refeições deliciosas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="rounded-full bg-green-100 p-4">
                    <ClipboardList className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold">1. Cadastre seus Ingredientes</h3>
                  <p className="text-muted-foreground">
                    Adicione os ingredientes que você tem disponíveis no seu frigorífico.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="rounded-full bg-amber-100 p-4">
                    <CheckCircle2 className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold">2. Receba Sugestões</h3>
                  <p className="text-muted-foreground">
                    Nossa IA analisa seus ingredientes e sugere receitas deliciosas.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="rounded-full bg-green-100 p-4">
                    <ChefHat className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold">3. Cozinhe e Aproveite</h3>
                  <p className="text-muted-foreground">
                    Siga as instruções de preparo e desfrute de refeições deliciosas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Receitas em Destaque */}
      <section className="py-16">
        <div className="container flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Receitas em Destaque</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Descubra algumas das receitas mais populares criadas pelos nossos usuários
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src="/placeholder.svg?height=192&width=384"
                  alt="Arroz de Frango"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">Arroz de Frango</h3>
                <p className="text-sm text-muted-foreground mt-2">Um prato completo de arroz com frango e legumes.</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>40 min</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    <span>Médio</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" onClick={() => router.push("/login")}>
                  Ver Receita
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src="/placeholder.svg?height=192&width=384"
                  alt="Salada de Tomate com Queijo"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">Salada de Tomate com Queijo</h3>
                <p className="text-sm text-muted-foreground mt-2">Uma salada fresca e rápida de preparar.</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>10 min</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    <span>Fácil</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" onClick={() => router.push("/login")}>
                  Ver Receita
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src="/placeholder.svg?height=192&width=384"
                  alt="Omelete de Tomate e Cebola"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">Omelete de Tomate e Cebola</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Um omelete simples e delicioso com tomate e cebola.
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>15 min</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    <span>Fácil</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700" onClick={() => router.push("/login")}>
                  Ver Receita
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button asChild variant="outline" size="lg" onClick={() => router.push("/login")}>
              <Link href="/login">Ver Todas as Receitas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 bg-green-50">
        <div className="container flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold">O Que Nossos Usuários Dizem</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Veja como o PlanEats tem ajudado pessoas a economizar tempo e dinheiro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="italic">
                    "O PlanEats revolucionou minha forma de cozinhar. Agora consigo aproveitar todos os ingredientes da
                    minha geladeira e descobrir receitas incríveis!"
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">João Silva</p>
                      <p className="text-sm text-muted-foreground">São Paulo, SP</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="italic">
                    "Reduzi o desperdício de alimentos em casa em mais de 70% desde que comecei a usar o PlanEats. As
                    receitas são deliciosas e fáceis de preparar!"
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Ana Martins</p>
                      <p className="text-sm text-muted-foreground">Rio de Janeiro, RJ</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="italic">
                    "Como estudante, o PlanEats me ajuda a economizar dinheiro e tempo. Consigo preparar refeições
                    deliciosas com o que tenho disponível!"
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>PO</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Pedro Oliveira</p>
                      <p className="text-sm text-muted-foreground">Belo Horizonte, MG</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold">Comece a Economizar Hoje</h2>
          <p className="mt-4 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que estão economizando tempo, dinheiro e reduzindo o desperdício de
            alimentos com o PlanEats.
          </p>
          <Button asChild size="lg" className="mt-8 bg-white text-green-600 hover:bg-gray-100">
            <Link href="/cadastro">Criar Conta Grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
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
              <p className="text-gray-400">Transformando ingredientes em refeições deliciosas.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Meu Frigorífico
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Receitas Sugeridas
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Explorar Receitas
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="text-gray-400 hover:text-white transition-colors">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/termos" className="text-gray-400 hover:text-white transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="text-gray-400 hover:text-white transition-colors">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2025 PlanEats. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
