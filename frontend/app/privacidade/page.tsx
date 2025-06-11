export default function PrivacidadePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Política de <span className="text-amber-300">Privacidade</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
            Sua privacidade é importante para nós. Saiba como coletamos, usamos e protegemos suas informações.
          </p>
        </div>
      </section>

      {/* Conteúdo da Política */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              <strong>Última atualização:</strong> 1º de Janeiro de 2025
            </p>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Informações que Coletamos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>
                    <strong>Informações de conta:</strong> Nome, e-mail, senha
                  </li>
                  <li>
                    <strong>Informações de uso:</strong> Ingredientes cadastrados, receitas visualizadas
                  </li>
                  <li>
                    <strong>Informações técnicas:</strong> Endereço IP, tipo de navegador, dispositivo
                  </li>
                  <li>
                    <strong>Cookies:</strong> Para melhorar a experiência do usuário
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Como Usamos suas Informações</h2>
                <p className="text-gray-600 leading-relaxed mb-4">Utilizamos suas informações para:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Fornecer sugestões personalizadas de receitas</li>
                  <li>Melhorar nossos algoritmos de recomendação</li>
                  <li>Comunicar atualizações e novidades do serviço</li>
                  <li>Fornecer suporte técnico</li>
                  <li>Analisar padrões de uso para melhorar o serviço</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Compartilhamento de Informações</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Não vendemos suas informações pessoais. Podemos compartilhar informações apenas:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Com seu consentimento explícito</li>
                  <li>Para cumprir obrigações legais</li>
                  <li>Com prestadores de serviços que nos ajudam a operar a plataforma</li>
                  <li>Em caso de fusão ou aquisição da empresa</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Segurança dos Dados</h2>
                <p className="text-gray-600 leading-relaxed">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra
                  acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia, controles de
                  acesso e monitoramento regular de segurança.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Seus Direitos</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Você tem os seguintes direitos sobre suas informações pessoais:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>
                    <strong>Acesso:</strong> Solicitar uma cópia dos dados que temos sobre você
                  </li>
                  <li>
                    <strong>Correção:</strong> Corrigir informações imprecisas ou incompletas
                  </li>
                  <li>
                    <strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais
                  </li>
                  <li>
                    <strong>Portabilidade:</strong> Receber seus dados em formato estruturado
                  </li>
                  <li>
                    <strong>Objeção:</strong> Opor-se ao processamento de seus dados
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Cookies e Tecnologias Similares</h2>
                <p className="text-gray-600 leading-relaxed">
                  Usamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do site e
                  personalizar conteúdo. Você pode controlar o uso de cookies através das configurações do seu
                  navegador.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Retenção de Dados</h2>
                <p className="text-gray-600 leading-relaxed">
                  Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos
                  nesta política, a menos que um período de retenção mais longo seja exigido por lei.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Transferências Internacionais</h2>
                <p className="text-gray-600 leading-relaxed">
                  Seus dados podem ser transferidos e processados em países diferentes do seu país de residência.
                  Garantimos que essas transferências sejam feitas com proteções adequadas.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Menores de Idade</h2>
                <p className="text-gray-600 leading-relaxed">
                  Nosso serviço não é direcionado a menores de 13 anos. Não coletamos intencionalmente informações
                  pessoais de crianças menores de 13 anos.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Alterações nesta Política</h2>
                <p className="text-gray-600 leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações
                  significativas por e-mail ou através de um aviso em nosso serviço.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contato</h2>
                <p className="text-gray-600 leading-relaxed">
                  Para questões sobre esta Política de Privacidade ou para exercer seus direitos, entre em contato
                  conosco:
                </p>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>E-mail:</strong>{" "}
                    <a href="mailto:privacidade@planeats.com" className="text-green-600 hover:text-green-700">
                      privacidade@planeats.com
                    </a>
                    <br />
                    <strong>Endereço:</strong> Faro - Portugal
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
