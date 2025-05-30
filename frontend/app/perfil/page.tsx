// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { Camera, Edit, Heart, Clock, ChefHat, Award } from "lucide-react"
// import Image from "next/image"

// export default function Perfil() {
//   return (
//     <div className="container py-8">
//       <div className="flex flex-col gap-8">
//         <div className="flex flex-col md:flex-row gap-6 items-start">
//           <Card className="w-full md:w-80">
//             <CardHeader className="text-center">
//               <div className="flex flex-col items-center gap-4">
//                 <div className="relative">
//                   <Avatar className="h-24 w-24">
//                     <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Foto de perfil" />
//                     <AvatarFallback>US</AvatarFallback>
//                   </Avatar><Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
//                     <Camera className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold">Maria Silva</h2>
//                   <p className="text-sm text-muted-foreground">maria.silva@email.com</p>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent><div className="flex flex-col gap-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm font-medium">Receitas Salvas</span>
//                   <Badge variant="secondary">24</Badge>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm font-medium">Receitas Criadas</span>
//                   <Badge variant="secondary">8</Badge>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm font-medium">Ingredientes Cadastrados</span>
//                   <Badge variant="secondary">32</Badge>
//                 </div>
//               </div></CardContent>
//             <CardFooter>
//               <Button variant="outline" className="w-full">
//                 <Edit className="mr-2 h-4 w-4" />
//                 Editar Perfil
//               </Button>
//             </CardFooter>
//           </Card> <div className="flex-1">
//             <Tabs defaultValue="informacoes" className="w-full">
//               <TabsList className="mb-4">
//                 <TabsTrigger value="informacoes">Informações</TabsTrigger>
//                 <TabsTrigger value="receitas-salvas">Receitas Salvas</TabsTrigger>
//                 <TabsTrigger value="receitas-criadas">Receitas Criadas</TabsTrigger>
//                 <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
//               </TabsList><TabsContent value="informacoes">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Informações Pessoais</CardTitle>
//                     <CardDescription>Atualize suas informações pessoais</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="nome">Nome</Label>
//                         <Input id="nome" defaultValue="Maria Silva" />
//                       </div><div className="space-y-2">
//                         <Label htmlFor="email">Email</Label>
//                         <Input id="email" defaultValue="maria.silva@email.com" />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="telefone">Telefone</Label>
//                         <Input id="telefone" defaultValue="(11) 98765-4321" />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="data-nascimento">Data de Nascimento</Label>
//                         <Input id="data-nascimento" type="date" defaultValue="1990-01-01" />
//                       </div>
//                     </div>
// <div className="space-y-2">
//                       <Label htmlFor="bio">Biografia</Label>
//                       <textarea
//                         id="bio"
//                         className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                         defaultValue="Apaixonada por culinária e sempre em busca de novas receitas para experimentar. Adoro cozinhar para a família e amigos nos finais de semana."
//                       />
//                     </div> <div className="space-y-2">
//                       <Label>Preferências Alimentares</Label>
//                       <div className="flex flex-wrap gap-2">
//                         <Badge variant="outline">Vegetariano</Badge>
//                         <Badge variant="outline">Sem Glúten</Badge>
//                         <Badge variant="outline">Baixo Carboidrato</Badge>
//                         <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
//                           <Edit className="mr-1 h-3 w-3" />
//                           Editar
//                         </Button> </div>
//                     </div>
//                   </CardContent>
//                   <CardFooter>
//                     <Button className="bg-green-600 hover:bg-green-700">Salvar Alterações</Button>
//                   </CardFooter>
//                 </Card>
//               </TabsContent>
//               <TabsContent value="receitas-salvas">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <Card className="overflow-hidden">
//                     <CardHeader className="p-0">
//                       <div className="relative h-40 w-full">
//                         <Image
//                           src="/placeholder.svg?height=160&width=320"
//                           alt="Arroz de Frango"
//                           fill
//                           className="object-cover"
//                         /><Button
//                           size="icon"
//                           variant="ghost"
//                           className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-rose-500"
//                         >
//                           <Heart className="h-4 w-4 fill-current" />
//                         </Button>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="p-4"><div className="flex flex-col gap-2">
//                         <h3 className="text-lg font-semibold">Arroz de Frango</h3>
//                         <div className="flex items-center gap-4">
//                           <div className="flex items-center gap-1 text-sm">
//                             <Clock className="h-4 w-4 text-muted-foreground" />
//                             <span>40 min</span>
//                           </div>
//                           <div className="flex items-center gap-1 text-sm">
//                             <ChefHat className="h-4 w-4 text-muted-foreground" />
//                             <span>Médio</span>
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>  <Card className="overflow-hidden">
//                     <CardHeader className="p-0">
//                       <div className="relative h-40 w-full">
//                         <Image
//                           src="/placeholder.svg?height=160&width=320"
//                           alt="Salada de Tomate com Queijo"
//                           fill
//                           className="object-cover"
//                         />
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-rose-500"
//                         > <Heart className="h-4 w-4 fill-current" />
//                         </Button>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="p-4">
//                       <div className="flex flex-col gap-2">
//                         <h3 className="text-lg font-semibold">Salada de Tomate com Queijo</h3>
//                         <div className="flex items-center gap-4">
//                           <div className="flex items-center gap-1 text-sm">
//                             <Clock className="h-4 w-4 text-muted-foreground" />
//                             <span>10 min</span>
//                           </div>
//                           <div className="flex items-center gap-1 text-sm">
//                             <ChefHat className="h-4 w-4 text-muted-foreground" />
//                             <span>Fácil</span> </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </TabsContent>
//  <TabsContent value="conquistas">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <Card>
//                     <CardContent className="pt-6 text-center">
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="rounded-full bg-amber-100 p-3">
//                           <Award className="h-8 w-8 text-amber-600" />
//                         </div>
//                         <h3 className="font-medium">Chef Iniciante</h3>
//                         <p className="text-sm text-muted-foreground">Preparou 10 receitas diferentes</p>
//                       </div>
//                     </CardContent>
//                   </Card> <Card>
//                     <CardContent className="pt-6 text-center">
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="rounded-full bg-green-100 p-3">
//                           <Award className="h-8 w-8 text-green-600" />
//                         </div>
//                         <h3 className="font-medium">Organizador</h3>
//                         <p className="text-sm text-muted-foreground">Cadastrou 30 ingredientes</p>
//                       </div>
//                     </CardContent>
//                   </Card> <Card>
//                     <CardContent className="pt-6 text-center">
//                       <div className="flex flex-col items-center gap-2">
//                         <div className="rounded-full bg-gray-100 p-3">
//                           <Award className="h-8 w-8 text-gray-400" />
//                         </div>
//                         <h3 className="font-medium">Chef Criativo</h3>
//                         <p className="text-sm text-muted-foreground">Criou 5 receitas próprias</p>
//                         <Badge variant="outline" className="mt-2">
//                           Em progresso: 2/5
//                         </Badge>
//                       </div> </CardContent>
//                   </Card>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Edit, Heart, Clock, ChefHat, Award } from "lucide-react"
import Image from "next/image"

export default function Perfil() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setAvatarUrl(imageUrl)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Card className="w-full md:w-80">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl || "/placeholder.svg?height=96&width=96"} alt="Foto de perfil" />
                    <AvatarFallback>US</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    onClick={handleAvatarClick}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Maria Silva</h2>
                  <p className="text-sm text-muted-foreground">maria.silva@email.com</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Receitas Salvas</span>
                  <Badge variant="secondary">24</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Receitas Criadas</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ingredientes Cadastrados</span>
                  <Badge variant="secondary">32</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            </CardFooter>
          </Card>

          <div className="flex-1">
            <Tabs defaultValue="informacoes" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="informacoes">Informações</TabsTrigger>
                <TabsTrigger value="receitas-salvas">Receitas Salvas</TabsTrigger>
                <TabsTrigger value="receitas-criadas">Receitas Criadas</TabsTrigger>
                <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
              </TabsList>
              <TabsContent value="informacoes">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Atualize suas informações pessoais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" defaultValue="Maria Silva" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue="maria.silva@email.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input id="telefone" defaultValue="(11) 98765-4321" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data-nascimento">Data de Nascimento</Label>
                        <Input id="data-nascimento" type="date" defaultValue="1990-01-01" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="Apaixonada por culinária e sempre em busca de novas receitas para experimentar. Adoro cozinhar para a família e amigos nos finais de semana."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferências Alimentares</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Vegetariano</Badge>
                        <Badge variant="outline">Sem Glúten</Badge>
                        <Badge variant="outline">Baixo Carboidrato</Badge>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Edit className="mr-1 h-3 w-3" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-green-600 hover:bg-green-700">Salvar Alterações</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="receitas-salvas">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-40 w-full">
                        <Image
                          src="/placeholder.svg?height=160&width=320"
                          alt="Arroz de Frango"
                          fill
                          className="object-cover"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-rose-500"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold">Arroz de Frango</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>40 min</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <ChefHat className="h-4 w-4 text-muted-foreground" />
                            <span>Médio</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative h-40 w-full">
                        <Image
                          src="/placeholder.svg?height=160&width=320"
                          alt="Salada de Tomate com Queijo"
                          fill
                          className="object-cover"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 text-rose-500"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold">Salada de Tomate com Queijo</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>10 min</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <ChefHat className="h-4 w-4 text-muted-foreground" />
                            <span>Fácil</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="conquistas">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-amber-100 p-3">
                          <Award className="h-8 w-8 text-amber-600" />
                        </div>
                        <h3 className="font-medium">Chef Iniciante</h3>
                        <p className="text-sm text-muted-foreground">Preparou 10 receitas diferentes</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-green-100 p-3">
                          <Award className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-medium">Organizador</h3>
                        <p className="text-sm text-muted-foreground">Cadastrou 30 ingredientes</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="rounded-full bg-gray-100 p-3">
                          <Award className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="font-medium">Chef Criativo</h3>
                        <p className="text-sm text-muted-foreground">Criou 5 receitas próprias</p>
                        <Badge variant="outline" className="mt-2">
                          Em progresso: 2/5
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
