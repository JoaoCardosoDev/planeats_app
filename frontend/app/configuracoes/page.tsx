import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Lock, Globe, Moon, Sun, Smartphone, Palette } from "lucide-react"

export default function Configuracoes() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
        </div>

        <Tabs defaultValue="conta" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="conta">Conta</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
            <TabsTrigger value="privacidade">Privacidade</TabsTrigger>
          </TabsList>

          <TabsContent value="conta">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta</CardTitle>
                  <CardDescription>Atualize as informações básicas da sua conta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome-usuario">Nome de Usuário</Label>
                      <Input id="nome-usuario" defaultValue="mariasilva" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-conta">Email</Label>
                      <Input id="email-conta" defaultValue="maria.silva@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idioma">Idioma</Label>
                    <Select defaultValue="pt-BR">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-green-600 hover:bg-green-700">Salvar Alterações</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>Atualize sua senha para manter sua conta segura</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha-atual">Senha Atual</Label>
                    <Input id="senha-atual" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nova-senha">Nova Senha</Label>
                    <Input id="nova-senha" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                    <Input id="confirmar-senha" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-green-600 hover:bg-green-700">Alterar Senha</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Excluir Conta</CardTitle>
                  <CardDescription>Excluir sua conta é uma ação permanente e não pode ser desfeita</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Ao excluir sua conta, todos os seus dados, incluindo receitas salvas, ingredientes cadastrados e
                    preferências serão permanentemente removidos.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive">Excluir Conta</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>Escolha como e quando deseja receber notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações por Email
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-receitas" className="text-base">
                          Novas Receitas Sugeridas
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receba emails quando novas receitas forem sugeridas com base nos seus ingredientes
                        </p>
                      </div>
                      <Switch id="email-receitas" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-dicas" className="text-base">
                          Dicas e Truques
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receba emails com dicas culinárias e truques para aproveitar melhor os alimentos
                        </p>
                      </div>
                      <Switch id="email-dicas" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-marketing" className="text-base">
                          Comunicações de Marketing
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receba emails sobre promoções, novidades e atualizações do PlanEats
                        </p>
                      </div>
                      <Switch id="email-marketing" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Notificações no Aplicativo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="app-alimentos" className="text-base">
                          Alimentos Prestes a Vencer
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receba alertas quando alimentos estiverem próximos da data de validade
                        </p>
                      </div>
                      <Switch id="app-alimentos" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="app-receitas" className="text-base">
                          Novas Receitas
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações quando novas receitas forem adicionadas
                        </p>
                      </div>
                      <Switch id="app-receitas" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequencia">Frequência de Notificações</Label>
                  <Select defaultValue="diaria">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">Diária</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-green-600 hover:bg-green-700">Salvar Preferências</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize a aparência do PlanEats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Tema
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center gap-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <Sun className="h-8 w-8 text-amber-500" />
                      <span className="font-medium">Claro</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <Moon className="h-8 w-8 text-indigo-500" />
                      <span className="font-medium">Escuro</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 bg-muted/50">
                      <div className="flex">
                        <Sun className="h-8 w-8 text-amber-500" />
                        <Moon className="h-8 w-8 text-indigo-500 -ml-2" />
                      </div>
                      <span className="font-medium">Sistema</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Unidades de Medida
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="metrico" className="text-base">
                          Sistema Métrico
                        </Label>
                        <p className="text-sm text-muted-foreground">Usar gramas, quilos, mililitros, etc.</p>
                      </div>
                      <Switch id="metrico" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="imperial" className="text-base">
                          Sistema Imperial
                        </Label>
                        <p className="text-sm text-muted-foreground">Usar onças, libras, xícaras, etc.</p>
                      </div>
                      <Switch id="imperial" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tamanho-fonte">Tamanho da Fonte</Label>
                  <Select defaultValue="medio">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tamanho da fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pequeno">Pequeno</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-green-600 hover:bg-green-700">Salvar Preferências</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacidade">
            <Card>
              <CardHeader>
                <CardTitle>Privacidade e Segurança</CardTitle>
                <CardDescription>Gerencie suas configurações de privacidade e segurança</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Privacidade da Conta
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="perfil-publico" className="text-base">
                          Perfil Público
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Permitir que outros usuários vejam seu perfil e receitas criadas
                        </p>
                      </div>
                      <Switch id="perfil-publico" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="compartilhar-receitas" className="text-base">
                          Compartilhar Receitas
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Permitir que suas receitas criadas sejam compartilhadas com outros usuários
                        </p>
                      </div>
                      <Switch id="compartilhar-receitas" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dados-uso" className="text-base">
                          Dados de Uso
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Compartilhar dados de uso anônimos para melhorar o PlanEats
                        </p>
                      </div>
                      <Switch id="dados-uso" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Verificação em Duas Etapas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="verificacao-duas-etapas" className="text-base">
                          Ativar Verificação em Duas Etapas
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Adicione uma camada extra de segurança à sua conta
                        </p>
                      </div>
                      <Switch id="verificacao-duas-etapas" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Sessões Ativas</h3>
                  <p className="text-sm text-muted-foreground">Dispositivos onde sua conta está conectada atualmente</p>

                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">iPhone 13 - São Paulo</p>
                          <p className="text-xs text-muted-foreground">Último acesso: Hoje, 14:32</p>
                        </div>
                      </div>
                      <Badge>Atual</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Chrome - Windows</p>
                          <p className="text-xs text-muted-foreground">Último acesso: Ontem, 19:45</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Encerrar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-green-600 hover:bg-green-700">Salvar Configurações</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
