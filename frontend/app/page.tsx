"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, ChefHat, ClipboardList, Clock, Star, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    // Intersection Observer para animações de scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".scroll-fade-in")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleCreateAccount = () => {
    router.push("/cadastro")
  }

  const handleViewRecipes = () => {
    // Scroll suave para a seção de receitas
    const recipesSection = document.getElementById("receitas-destaque")
    if (recipesSection) {
      recipesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="flex flex-col min-h-screen -mt-16">
      {/* Hero Section - Fixed height to prevent content hiding */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/images/planeats.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70"></div>

        {/* Gradiente de transição para a próxima seção */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6 drop-shadow-2xl">
              <span className="text-green-400">PLAN</span> SMARTER, <br />
              <span className="text-amber-500">EAT</span> BETTER
            </h1>
            <p className="text-xl text-white/95 mb-8 max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
              Transforme os ingredientes da sua geladeira em refeições deliciosas e reduza o desperdício de alimentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleCreateAccount}
                className="bg-green-600/90 hover:bg-green-700 text-white px-8 py-6 text-lg backdrop-blur-sm border border-green-500/30 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-1"
              >
                COMEÇAR
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-amber-400/80 text-amber-400 hover:bg-amber-400 hover:text-white px-8 py-6 text-lg transition-all duration-300 backdrop-blur-sm bg-white/10 hover:bg-amber-400 shadow-2xl hover:shadow-amber-500/25 hover:-translate-y-1"
                onClick={handleViewRecipes}
              >
                NOSSAS RECEITAS
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section - Com transição suave */}
      <section
        id="como-funciona"
        className="py-20 bg-gradient-to-b from-white via-green-50/30 to-green-50 scroll-fade-in relative"
        style={{
          marginTop: "-2rem",
        }}
      >
        {/* Elemento de transição sutil */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/80 to-transparent"></div>

        <div className="container flex flex-col gap-12 relative z-10">
          <div className="text-center animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Como Funciona</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Três passos simples para transformar os ingredientes da sua geladeira em refeições deliciosas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ClipboardList,
                number: "01",
                title: "Cadastre seus Ingredientes",
                description: "Adicione os ingredientes que você tem disponíveis no seu frigorífico.",
                color: "from-green-500 to-green-600",
                delay: "0.1s",
              },
              {
                icon: CheckCircle2,
                number: "02",
                title: "Receba Sugestões",
                description: "Nossa IA analisa seus ingredientes e sugere receitas deliciosas.",
                color: "from-amber-500 to-amber-600",
                delay: "0.2s",
              },
              {
                icon: ChefHat,
                number: "03",
                title: "Cozinhe e Aproveite",
                description: "Siga as instruções de preparo e desfrute de refeições deliciosas.",
                color: "from-green-500 to-green-600",
                delay: "0.3s",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="border-none shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm animate-fade-in-up group"
                style={{ animationDelay: item.delay }}
              >
                <CardContent className="pt-8 pb-6">
                  <div className="flex flex-col items-center text-center gap-6">
                    <div className="relative">
                      <div
                        className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-3xl flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110`}
                      >
                        <item.icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100">
                        <span className="text-sm font-bold text-gray-700">{item.number}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                      {item.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Receitas em Destaque */}
      <section id="receitas-destaque" className="py-20 scroll-fade-in bg-gradient-to-b from-green-50 to-white">
        <div className="container flex flex-col gap-12">
          <div className="text-center animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Receitas em Destaque</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Descubra algumas das receitas mais populares criadas pelos nossos usuários
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Arroz de Frango",
                description: "Um prato completo de arroz com frango e legumes.",
                time: "40 min",
                difficulty: "Médio",
                image: "/images/Arroz de Frango.png?height=192&width=384",
              },
              {
                title: "Salada de Tomate com Queijo",
                description: "Uma salada fresca e rápida de preparar.",
                time: "10 min",
                difficulty: "Fácil",
                image: "/images/Salada de Tomate com Queijo.png?height=192&width=384",
              },
              {
                title: "Omelete de Tomate e Cebola",
                description: "Um omelete simples e delicioso com tomate e cebola.",
                time: "15 min",
                difficulty: "Fácil",
                image: "/images/Omelete de Tomate e Cebola.png?height=192&width=384",
              },
            ].map((recipe, index) => (
              <Card
                key={index}
                className="stagger-item overflow-hidden card-hover group flex flex-col h-full bg-white/90 backdrop-blur-sm border-none shadow-xl"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    fill
                    className="object-cover image-hover transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-4 text-white text-sm">
                      <div className="flex items-center gap-1 bg-black/40 rounded-full px-3 py-1 backdrop-blur-sm">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.time}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/40 rounded-full px-3 py-1 backdrop-blur-sm">
                        <ChefHat className="h-3 w-3" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-green-600 transition-colors duration-300">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow leading-relaxed">{recipe.description}</p>

                  <Button
                    className="btn-primary w-full group/btn flex items-center justify-center mt-auto shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => router.push("/login")}
                  >
                    Ver Receita
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="btn-outline group flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => router.push("/login")}
            >
              Ver Todas as Receitas
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50 scroll-fade-in">
        <div className="container flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">O Que Nossos Usuários Dizem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Veja como o PlanEats tem ajudado pessoas a economizar tempo e dinheiro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "O PlanEats revolucionou minha forma de cozinhar. Agora consigo aproveitar todos os ingredientes da minha geladeira e descobrir receitas incríveis!",
                name: "João Silva",
                location: "São Paulo, SP",
                initials: "JS",
              },
              {
                quote:
                  "Reduzi o desperdício de alimentos em casa em mais de 70% desde que comecei a usar o PlanEats. As receitas são deliciosas e fáceis de preparar!",
                name: "Ana Martins",
                location: "Rio de Janeiro, RJ",
                initials: "AM",
              },
              {
                quote:
                  "Como estudante, o PlanEats me ajuda a economizar dinheiro e tempo. Consigo preparar refeições deliciosas com o que tenho disponível!",
                name: "Pedro Oliveira",
                location: "Belo Horizonte, MG",
                initials: "PO",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="stagger-item bg-white/90 backdrop-blur-sm border-none shadow-xl card-hover group"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="flex flex-col gap-6 h-full">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-5 w-5 fill-amber-400 text-amber-400 transition-transform duration-300 group-hover:scale-110"
                          style={{ transitionDelay: `${star * 0.1}s` }}
                        />
                      ))}
                    </div>

                    <blockquote className="text-gray-700 leading-relaxed flex-grow italic text-lg">
                      "{testimonial.quote}"
                    </blockquote>

                    <div className="flex items-center gap-4 mt-4">
                      <Avatar className="h-12 w-12 border-2 border-green-200 group-hover:border-green-400 transition-colors duration-300">
                        <AvatarFallback className="bg-gradient-to-br from-green-600 to-green-500 text-white font-semibold text-lg">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Fundo verde limpo sem padrão */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white relative overflow-hidden scroll-fade-in">
        <div className="container text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Comece a <span className="text-amber-300">Economizar</span> Hoje
            </h2>

            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Junte-se a milhares de usuários que estão economizando tempo, dinheiro e reduzindo o desperdício de
              alimentos com o PlanEats.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1 px-8 py-6 text-lg font-semibold"
                onClick={() => router.push("/cadastro")}
              >
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                size="lg"
                className="bg-white hover:bg-gray-50 text-green-600 border-2 border-white hover:border-gray-200 hover:text-green-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 px-8 py-6 text-lg font-semibold"
                onClick={() => router.push("/login")}
              >
                Já tenho conta
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Nova cor verde clarinho */}
      <footer className="py-12 bg-gradient-to-b from-green-100 to-green-50 text-gray-800">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center group">
                <Image
                  src="/images/Logo.png"
                  alt="PlanEats Logo"
                  width={50}
                  height={50}
                  className="rounded-full transition-transform duration-300 group-hover:scale-110"
                />
                <span
                  className="text-xl font-bold text-green-600 ml-2"
                  style={{
                    height: "20px",
                  }}
                >
                  Plan<span className="text-amber-500">Eats</span>
                </span>
              </Link>
              <p className="text-gray-600">Transformando ingredientes em refeições deliciosas.</p>
            </div>

            {[
              {
                title: "Recursos",
                links: [
                  { name: "Meu Frigorífico", href: "/login" },
                  { name: "Receitas Sugeridas", href: "/login" },
                  { name: "Explorar Receitas", href: "/login" },
                ],
              },
              {
                title: "Empresa",
                links: [
                  { name: "Sobre Nós", href: "/sobre" },
                  { name: "Contato", href: "/contato" },
                  { name: "Blog", href: "/blog" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { name: "Termos de Uso", href: "/termos" },
                  { name: "Política de Privacidade", href: "/privacidade" },
                  { name: "Política de Cookies", href: "/cookies" },
                ],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4 text-green-700">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-green-700 transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-green-200 text-center text-amber-600">
            <p>© 2025 PlanEats. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
