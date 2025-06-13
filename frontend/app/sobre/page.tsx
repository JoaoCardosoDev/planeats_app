import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Heart, Award } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SobrePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sobre o <span className="text-amber-300">PlanEats</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
            Transformamos a forma como você planeja suas refeições, reduzindo o desperdício de alimentos e criando
            experiências culinárias incríveis com os ingredientes que você já tem em casa.
          </p>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Nossa Missão</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Acreditamos que cada ingrediente tem potencial para se tornar uma refeição deliciosa. Nossa missão é
                conectar pessoas aos alimentos de forma inteligente, sustentável e prazerosa.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Através da tecnologia e inteligência artificial, ajudamos famílias a economizar tempo, dinheiro e
                reduzir o desperdício alimentar, criando um futuro mais sustentável.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Ingredientes frescos na cozinha"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-20 bg-green-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Nossos Valores</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Os princípios que guiam nossa jornada para transformar a experiência culinária
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: "Sustentabilidade",
                description: "Reduzimos o desperdício alimentar e promovemos práticas sustentáveis na cozinha.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Users,
                title: "Comunidade",
                description: "Conectamos pessoas através do amor pela comida e receitas compartilhadas.",
                color: "from-amber-500 to-amber-600",
              },
              {
                icon: Target,
                title: "Inovação",
                description: "Utilizamos tecnologia de ponta para criar soluções inteligentes e práticas.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Award,
                title: "Qualidade",
                description: "Oferecemos receitas testadas e aprovadas para garantir o melhor resultado.",
                color: "from-amber-500 to-amber-600",
              },
            ].map((value, index) => (
              <Card
                key={index}
                className="text-center border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="pt-8 pb-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  >
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">Nossa História</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                O PlanEats nasceu da frustração de ver alimentos sendo desperdiçados diariamente em nossas casas. Em
                2024, nossa equipe de desenvolvedores e chefs se uniu com um objetivo comum: criar uma solução que
                transformasse ingredientes esquecidos em refeições memoráveis.
              </p>
              <p>
                Começamos como um pequeno projeto, mas rapidamente percebemos o impacto positivo que poderíamos ter na
                vida das pessoas. Hoje, milhares de famílias usam o PlanEats para planejar suas refeições, economizar
                dinheiro e contribuir para um mundo mais sustentável.
              </p>
              <p>
                Nossa jornada está apenas começando. Continuamos inovando e expandindo nossas funcionalidades para
                oferecer a melhor experiência culinária possível.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Faça Parte da Nossa <span className="text-amber-300">Comunidade</span>
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Junte-se a milhares de pessoas que já transformaram sua forma de cozinhar
          </p>
          <Link href="/cadastro">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-lg font-semibold shadow-xl"
            >
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
