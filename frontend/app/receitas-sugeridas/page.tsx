import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ChefHat, Sparkles, Filter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ReceitasSugeridas() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Receitas Sugeridas</h1>
          <p className="text-muted-foreground">Receitas baseadas nos ingredientes do seu frigorífico</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button><Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              Tempo de preparo
            </Button>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/gerar-receitas">
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Novas Receitas
            </Link>
          </Button>
        </div><Tabs defaultValue="todas" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="rapidas">Rápidas</TabsTrigger>
            <TabsTrigger value="saudaveis">Saudáveis</TabsTrigger>
            <TabsTrigger value="economicas">Econômicas</TabsTrigger>
            <TabsTrigger value="favoritas">Favoritas</TabsTrigger>
          </TabsList>
           <TabsContent value="todas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Omelete de Tomate e Cebola */}
              <Card className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Omelete de Tomate e Cebola"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-green-600 hover:bg-green-700">Fácil</Badge>
                    </div>
                  </div> </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold">Omelete de Tomate e Cebola</h3>
                    <p className="text-sm text-muted-foreground">Um omelete simples e delicioso com tomate e cebola.</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>15 minutos</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                        <span>Fácil</span>
                      </div>
                    </div>
                  </div></CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Ver Receita</Button>
                </CardFooter>
              </Card>

              {/* Arroz de Frango */}
              <Card className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Arroz de Frango"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-amber-600 hover:bg-amber-700">Médio</Badge>
                    </div>
                  </div></CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold">Arroz de Frango</h3>
                    <p className="text-sm text-muted-foreground">Um prato completo de arroz com frango e legumes.</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>40 minutos</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                        <span>Médio</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Ver Receita</Button>
                </CardFooter>
              </Card>
              {/* Salada de Tomate com Queijo */}
              <Card className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Salada de Tomate com Queijo"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-green-600 hover:bg-green-700">Fácil</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold">Salada de Tomate com Queijo</h3>
                    <p className="text-sm text-muted-foreground">Uma salada fresca e rápida de preparar.</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>10 minutos</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                        <span>Fácil</span>
                      </div>
                    </div>
                     </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Ver Receita</Button>
                </CardFooter>
              </Card>
              {/* Mais receitas */}
              <Card className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Sopa de Legumes"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-green-600 hover:bg-green-700">Fácil</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold">Sopa de Legumes</h3>
                    <p className="text-sm text-muted-foreground">Uma sopa nutritiva com os legumes da sua geladeira.</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>30 minutos</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                        <span>Fácil</span>
                      </div>
                    </div>
                  </div>
                </CardContent><CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Ver Receita</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Outros conteúdos de abas aqui */} 
          <TabsContent value="rapidas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Omelete de Tomate e Cebola */}
              <Card className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Omelete de Tomate e Cebola"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-green-600 hover:bg-green-700">Fácil</Badge>
                    </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold">Omelete de Tomate e Cebola</h3>
                    <p className="text-sm text-muted-foreground">Um omelete simples e delicioso com tomate e cebola.</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>15 minutos</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                        <span>Fácil</span> </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Ver Receita</Button>
                </CardFooter>
              </Card>
              {/* Salada de Tomate com Queijo */}
              <Card className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Salada de Tomate com Queijo"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-green-600 hover:bg-green-700">Fácil</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4"><div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold">Salada de Tomate com Queijo</h3>
                    <p className="text-sm text-muted-foreground">Uma salada fresca e rápida de preparar.</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>10 minutos</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                        <span>Fácil</span>
                      </div>
                    </div>
                  </div>
                </CardContent><CardFooter className="p-4 pt-0">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Ver Receita</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}