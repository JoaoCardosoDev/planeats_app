import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, User, ArrowRight, Clock } from "lucide-react"
import Image from "next/image"

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "10 Dicas Para Reduzir o Desperdício de Alimentos",
      excerpt:
        "Aprenda estratégias práticas para aproveitar melhor os ingredientes da sua cozinha e economizar dinheiro.",
      author: "Equipe PlanEats",
      date: "15 de Janeiro, 2025",
      readTime: "5 min",
      image: "/placeholder.svg?height=300&width=500",
      category: "Sustentabilidade",
    },
    {
      id: 2,
      title: "Como Organizar Sua Geladeira Para Máxima Eficiência",
      excerpt:
        "Descubra a melhor forma de organizar seus alimentos para que durem mais tempo e sejam facilmente encontrados.",
      author: "Chef Maria Silva",
      date: "12 de Janeiro, 2025",
      readTime: "7 min",
      image: "/placeholder.svg?height=300&width=500",
      category: "Organização",
    },
    {
      id: 3,
      title: "Receitas Rápidas Para o Dia a Dia",
      excerpt:
        "Selecionamos as melhores receitas que podem ser preparadas em menos de 30 minutos usando ingredientes básicos.",
      author: "Chef João Santos",
      date: "10 de Janeiro, 2025",
      readTime: "4 min",
      image: "/placeholder.svg?height=300&width=500",
      category: "Receitas",
    },
    {
      id: 4,
      title: "Planejamento de Refeições: Guia Completo",
      excerpt: "Um guia passo a passo para planejar suas refeições semanais e economizar tempo e dinheiro na cozinha.",
      author: "Nutricionista Ana Costa",
      date: "8 de Janeiro, 2025",
      readTime: "8 min",
      image: "/placeholder.svg?height=300&width=500",
      category: "Planejamento",
    },
    {
      id: 5,
      title: "Ingredientes Versáteis Que Todo Cozinheiro Deve Ter",
      excerpt: "Conheça os ingredientes curingas que podem transformar qualquer refeição simples em algo especial.",
      author: "Chef Roberto Lima",
      date: "5 de Janeiro, 2025",
      readTime: "6 min",
      image: "/placeholder.svg?height=300&width=500",
      category: "Ingredientes",
    },
    {
      id: 6,
      title: "Tecnologia na Cozinha: O Futuro da Culinária",
      excerpt:
        "Como a inteligência artificial e apps estão revolucionando a forma como cozinhamos e planejamos refeições.",
      author: "Tech Team PlanEats",
      date: "3 de Janeiro, 2025",
      readTime: "5 min",
      image: "/placeholder.svg?height=300&width=500",
      category: "Tecnologia",
    },
  ]

  const categories = [
    "Todos",
    "Sustentabilidade",
    "Receitas",
    "Planejamento",
    "Organização",
    "Ingredientes",
    "Tecnologia",
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Blog <span className="text-amber-300">PlanEats</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
            Dicas, receitas e insights sobre culinária, sustentabilidade e planejamento de refeições para transformar
            sua experiência na cozinha.
          </p>
        </div>
      </section>

      {/* Filtros de Categoria */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "Todos" ? "default" : "outline"}
                className={category === "Todos" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts do Blog */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 group/btn"
                    >
                      Ler mais
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                Anterior
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Próximo</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Receba Nossas <span className="text-amber-300">Novidades</span>
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Inscreva-se em nossa newsletter e receba dicas exclusivas, receitas e novidades do PlanEats
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 font-semibold">Inscrever-se</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
