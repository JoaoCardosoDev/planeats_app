export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Política de <span className="text-amber-300">Cookies</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
            Entenda como usamos cookies para melhorar sua experiência no PlanEats.
          </p>
        </div>
      </section>

      {/* Conteúdo da Política de Cookies */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              <strong>Última atualização:</strong> 1º de Janeiro de 2025
            </p>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">1. O que são Cookies?</h2>
                <p className="text-gray-600 leading-relaxed">
                  Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você visita um
                  site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente e
                  fornecer informações aos proprietários do site.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Como Usamos Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">O PlanEats usa cookies para várias finalidades:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Manter você logado durante sua sessão</li>
                  <li>Lembrar suas preferências e configurações</li>
                  <li>Personalizar conteúdo e recomendações</li>
                  <li>Analisar como você usa nosso site</li>
                  <li>Melhorar a segurança e prevenir fraudes</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Tipos de Cookies que Usamos</h2>

                <div className="space-y-6">
                  <div className="p-6 bg-green-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Cookies Essenciais</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Estes cookies são necessários para o funcionamento básico do site. Eles permitem que você navegue
                      pelo site e use recursos essenciais como áreas seguras e carrinho de compras.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Duração:</strong> Sessão
                    </p>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Cookies de Performance</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Estes cookies coletam informações sobre como você usa nosso site, como quais páginas você visita
                      com mais frequência. Essas informações nos ajudam a melhorar o desempenho do site.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Duração:</strong> 2 anos
                    </p>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Cookies de Funcionalidade</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Estes cookies permitem que o site lembre das escolhas que você faz e forneça recursos aprimorados
                      e mais personalizados, como lembrar seu nome de usuário e preferências.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Duração:</strong> 1 ano
                    </p>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Cookies de Marketing</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Estes cookies são usados para entregar anúncios mais relevantes para você e seus interesses. Eles
                      também são usados para limitar o número de vezes que você vê um anúncio.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Duração:</strong> 6 meses
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Cookies de Terceiros</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Também usamos cookies de terceiros confiáveis para nos ajudar a analisar e entender como você usa este
                  site. Estes incluem:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>
                    <strong>Google Analytics:</strong> Para análise de tráfego e comportamento do usuário
                  </li>
                  <li>
                    <strong>Redes Sociais:</strong> Para integração com plataformas sociais
                  </li>
                  <li>
                    <strong>Serviços de Pagamento:</strong> Para processar transações seguras
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Gerenciando Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Você tem controle sobre os cookies e pode gerenciá-los de várias maneiras:
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Configurações do Navegador</h4>
                    <p className="text-gray-600 text-sm">
                      A maioria dos navegadores permite que você controle cookies através das configurações. Você pode
                      definir seu navegador para recusar cookies ou alertá-lo quando cookies estão sendo enviados.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Opt-out de Cookies de Marketing</h4>
                    <p className="text-gray-600 text-sm">
                      Você pode optar por não receber cookies de marketing visitando as páginas de opt-out dos
                      respectivos fornecedores de publicidade.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Impacto de Desabilitar Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Se você escolher desabilitar cookies, algumas funcionalidades do PlanEats podem não funcionar
                  corretamente:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Você pode precisar fazer login repetidamente</li>
                  <li>Suas preferências podem não ser salvas</li>
                  <li>Algumas funcionalidades personalizadas podem não estar disponíveis</li>
                  <li>A experiência geral do site pode ser prejudicada</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Atualizações desta Política</h2>
                <p className="text-gray-600 leading-relaxed">
                  Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossos serviços ou
                  requisitos legais. Recomendamos que você revise esta página regularmente.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Contato</h2>
                <p className="text-gray-600 leading-relaxed">
                  Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato conosco:
                </p>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>E-mail:</strong>{" "}
                    <a href="mailto:cookies@planeats.com" className="text-green-600 hover:text-green-700">
                      cookies@planeats.com
                    </a>
                    <br />
                    <strong>Página de Contato:</strong>{" "}
                    <a href="/contato" className="text-green-600 hover:text-green-700">
                      /contato
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
