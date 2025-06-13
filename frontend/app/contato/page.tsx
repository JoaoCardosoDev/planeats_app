"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { useState } from "react"

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    assunto: "",
    mensagem: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você implementaria o envio do formulário
    alert("Mensagem enviada com sucesso! Entraremos em contato em breve.")
    setFormData({ nome: "", email: "", assunto: "", mensagem: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Entre em <span className="text-amber-300">Contato</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
            Estamos aqui para ajudar! Entre em contato conosco para dúvidas, sugestões ou suporte técnico.
          </p>
        </div>
      </section>

      {/* Formulário e Informações */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <Card className="shadow-2xl border-none">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Envie sua Mensagem</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      required
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="assunto" className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto
                    </label>
                    <Input
                      id="assunto"
                      name="assunto"
                      type="text"
                      required
                      value={formData.assunto}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Assunto da sua mensagem"
                    />
                  </div>

                  <div>
                    <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <Textarea
                      id="mensagem"
                      name="mensagem"
                      required
                      value={formData.mensagem}
                      onChange={handleChange}
                      className="w-full min-h-32"
                      placeholder="Descreva sua dúvida ou sugestão..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                  >
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Informações de Contato */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Informações de Contato</h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  Nossa equipe está sempre pronta para ajudar. Entre em contato através dos canais abaixo ou envie uma
                  mensagem usando o formulário ao lado.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: "E-mail",
                    info: "contato@planeats.com",
                    description: "Resposta em até 24 horas",
                  },
                  {
                    icon: Phone,
                    title: "Telefone",
                    info: "+55 (11) 9999-9999",
                    description: "Seg-Sex, 9h às 18h",
                  },
                  {
                    icon: MapPin,
                    title: "Endereço",
                    info: "São Paulo, SP - Brasil",
                    description: "Atendimento remoto",
                  },
                  {
                    icon: Clock,
                    title: "Horário de Atendimento",
                    info: "Segunda a Sexta",
                    description: "9h às 18h (horário de Brasília)",
                  },
                ].map((contact, index) => (
                  <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <contact.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">{contact.title}</h3>
                          <p className="text-green-600 font-medium mb-1">{contact.info}</p>
                          <p className="text-sm text-gray-500">{contact.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Rápido */}
      <section className="py-20 bg-green-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Perguntas Frequentes</h2>
            <p className="text-gray-600">Respostas rápidas para as dúvidas mais comuns</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                pergunta: "Como funciona o PlanEats?",
                resposta:
                  "Você cadastra os ingredientes que tem em casa e nossa IA sugere receitas personalizadas para você.",
              },
              {
                pergunta: "O serviço é gratuito?",
                resposta: "Sim! O PlanEats oferece funcionalidades básicas gratuitas, com opções premium disponíveis.",
              },
              {
                pergunta: "Posso sugerir novas receitas?",
                resposta: "Claro! Adoramos receber sugestões da nossa comunidade. Use o formulário de contato.",
              },
              {
                pergunta: "Como posso reportar um problema?",
                resposta:
                  "Entre em contato conosco através do e-mail ou formulário, descreva o problema e te ajudaremos.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">{faq.pergunta}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.resposta}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}