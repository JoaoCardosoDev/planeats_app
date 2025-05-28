import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react"
import Image from "next/image"

export default function MeuFrigorifico() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Meu Frigorífico</h1>
          <p className="text-muted-foreground">Gerencie os ingredientes disponíveis em sua casa</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar ingredientes..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/adicionar-itens">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Ingredientes
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/receitas-sugeridas">Ver Receitas</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="vegetais">Vegetais</TabsTrigger>
            <TabsTrigger value="proteinas">Proteínas</TabsTrigger>
            <TabsTrigger value="graos">Grãos</TabsTrigger>
            <TabsTrigger value="laticinios">Laticínios</TabsTrigger>
            <TabsTrigger value="temperos">Temperos</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tomate */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 shrink-0">
                      <Image src="/placeholder.svg?height=96&width=96" alt="Tomate" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Tomate</h3>
                          <p className="text-sm text-muted-foreground">5 unidades</p>
                          <Badge variant="outline" className="mt-1">
                            Vegetal
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cebola */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 shrink-0">
                      <Image src="/placeholder.svg?height=96&width=96" alt="Cebola" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Cebola</h3>
                          <p className="text-sm text-muted-foreground">3 unidades</p>
                          <Badge variant="outline" className="mt-1">
                            Vegetal
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Frango */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 shrink-0">
                      <Image src="/placeholder.svg?height=96&width=96" alt="Frango" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Frango</h3>
                          <p className="text-sm text-muted-foreground">500g</p>
                          <Badge variant="outline" className="mt-1">
                            Proteína
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Arroz */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 shrink-0">
                      <Image src="/placeholder.svg?height=96&width=96" alt="Arroz" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Arroz</h3>
                          <p className="text-sm text-muted-foreground">1kg</p>
                          <Badge variant="outline" className="mt-1">
                            Grãos
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alho */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 shrink-0">
                      <Image src="/placeholder.svg?height=96&width=96" alt="Alho" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Alho</h3>
                          <p className="text-sm text-muted-foreground">1 cabeça</p>
                          <Badge variant="outline" className="mt-1">
                            Tempero
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leite */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 shrink-0">
                      <Image src="/placeholder.svg?height=96&width=96" alt="Leite" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Leite</h3>
                          <p className="text-sm text-muted-foreground">1L</p>
                          <Badge variant="outline" className="mt-1">
                            Laticínio
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vegetais" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tomate */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 shrink-0">
                      <Image src="/placeholder.svg?height=96&width=96" alt="Tomate" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Tomate</h3>
                          <p className="text-sm text-muted-foreground">5 unidades</p>
                          <Badge variant="outline" className="mt-1">
                            Vegetal
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cebola */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 shrink-0">
                      <Image src="/placeholder.svg?height=96&width=96" alt="Cebola" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Cebola</h3>
                          <p className="text-sm text-muted-foreground">3 unidades</p>
                          <Badge variant="outline" className="mt-1">
                            Vegetal
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Outros conteúdos de abas aqui */}
          <TabsContent value="proteinas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Frango */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="relative h-24 w-24 shrink-0">
                      <Image src="/placeholder.svg?height=96&width=96" alt="Frango" fill className="object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Frango</h3>
                          <p className="text-sm text-muted-foreground">500g</p>
                          <Badge variant="outline" className="mt-1">
                            Proteína
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
