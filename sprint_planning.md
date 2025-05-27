# Plano de Desenvolvimento PlanEats (MVP - 33 Horas) com Integração IA

**Objetivo Principal:** Entregar um MVP funcional que inclua registo/login, gestão básica de despensa e receitas, e uma funcionalidade de geração de receitas personalizadas via API Gemini, tudo dentro de 33 horas de desenvolvimento da equipa.

**Pressupostos:**
*   Familiaridade da equipa com as tecnologias.
*   As 33 horas são focadas no desenvolvimento técnico.
*   Configuração inicial do projeto e Docker será rápida.
*   Documentação e testes serão mínimos e focados no essencial.

**Divisão de Sprints (Iterações):**
*   **Sprint 1 (Fundação & Autenticação Core):** ~10 horas
*   **Sprint 2 (Despensa, Receitas Manuais & Setup IA):** ~12 horas
*   **Sprint 3 (Integração IA, Polimento Essencial & Entrega):** ~11 horas

---

## Sprint 1: Fundação & Autenticação Core (~10 horas)

**Milestone:** Sistema de autenticação funcional (registo, login, logout) com sessões seguras. Backend e frontend básicos comunicam dentro de Docker.

**Cartões Chave (Foco Absoluto):**
*   `US6.1: Configuração do Projeto Backend FastAPI (SQLModel)` (essenciais)
*   `US6.2: Configuração do Projeto Frontend Next.js (TypeScript, Tailwind)` (essenciais)
*   `US6.3: Configuração da Base de Dados PostgreSQL`
*   `US6.4: Configuração Docker & Docker Compose`
*   `US1.1: Registo de Utilizador`
*   `US1.4: Armazenamento Seguro de Password (Hashing)`
*   `US1.2: Login de Utilizador (com NextAuth.js)`
*   `US1.3: Gestão de Sessão JWT (NextAuth.js & FastAPI)`
*   `US1.5: Logout de Utilizador (com NextAuth.js)`
*   `US6.8: Implementar Medidas de Segurança Definidas` (foco em hashing, validação básica, CORS, gestão de segredos para autenticação)

**Entregável do Sprint 1:**
*   Utilizadores conseguem registar-se, fazer login e logout.
*   Sessões são mantidas de forma segura.
*   Endpoints de autenticação protegidos.
*   Aplicação base a correr em Docker.

---

## Sprint 2: Despensa, Receitas Manuais & Setup IA (~12 horas)

**Milestone:** Utilizadores autenticados conseguem gerir a sua despensa (adicionar/listar itens) e adicionar/visualizar receitas manualmente. O setup para a integração IA (Gemini) é preparado no backend.

**Cartões Chave:**
*   `US2.1: Adicionar Novo Item à Despensa` (funcionalidade completa)
*   `US2.2: Listar Todos os Itens da Despensa` (funcionalidade completa)
*   `US3.4: Adicionar Nova Receita Criada pelo Utilizador` (funcionalidade completa, UI para ingredientes pode ser simples)
*   `US3.1: Listar Receitas Disponíveis` (para receitas adicionadas por utilizadores)
*   `US3.3: Ver Detalhes da Receita` (para as receitas listadas)
*   **Nova Tarefa Técnica (Backend - Preparação IA):**
    *   **Título:** `[BE] Setup Inicial para Integração API Gemini`
    *   **Descrição:** Configurar o cliente da API Gemini no backend FastAPI. Gerir a chave da API de forma segura através de variáveis de ambiente. Criar uma função placeholder ou um endpoint de teste interno para verificar a conectividade com a API Gemini (sem lógica de negócio ainda).
    *   **Checklist:**
        *   `[ ] [BE] Adicionar biblioteca cliente da API Gemini ao `requirements.txt`.`
        *   `[ ] [BE] Configurar variável de ambiente para a chave da API Gemini no `.env` e `docker-compose.yml`.`
        *   `[ ] [BE] Implementar uma função básica no backend para inicializar o cliente Gemini e fazer uma chamada de teste simples à API (ex: listar modelos disponíveis ou um pedido genérico de "olá").`
        *   `[ ] [BE] Adicionar logging básico para chamadas à API Gemini.`

**Entregável do Sprint 2:**
*   Gestão de Despensa: Adicionar e listar itens funcional.
*   Gestão de Receitas Manuais: Adicionar, listar e ver detalhes funcional.
*   Backend preparado para comunicar com a API Gemini.

---

## Sprint 3: Integração IA, Polimento Essencial & Entrega (~11 horas)

**Milestone:** Funcionalidade de geração de receitas personalizadas via API Gemini implementada e integrada. Polimento mínimo da UI/UX e documentação essencial para o MVP.

**Cartões Chave:**
*   `US4.4: Geração de Receita Personalizada por IA (Gemini)`
    *   **Simplificação:** O frontend para selecionar itens da despensa pode ser uma lista simples de checkboxes com os nomes dos itens. Os inputs de calorias, tempo, etc., podem ser campos de texto simples. A exibição da receita gerada pode ser texto plano.
    *   A funcionalidade de guardar a receita gerada pela IA (`POST /ai/custom-recipes/{generation_id}/save`) é **adiada/opcional** para este MVP se o tempo for curto.
*   `US2.4: Atualizar Item da Despensa` (se essencial e houver tempo) OU `US2.5: Eliminar Item da Despensa` (escolher um, se houver tempo)
*   `US6.5: Implementar Logging da Aplicação` (logs essenciais para autenticação e chamadas IA)
*   `US6.6: Implementar Testes Unitários` (foco muito seletivo: funções de hashing/verificação de password, e talvez a lógica de construção do prompt para a Gemini, mockando a chamada à API).
*   `US7.3: Criar Documentação Técnica` (README com:
    *   Instruções de setup e execução (`docker-compose up`).
    *   Descrição muito breve da arquitetura.
    *   Modelo de dados simplificado (nomes das tabelas e colunas principais).
    *   Endpoints principais da API (gerados pelo FastAPI /docs é suficiente aqui).
    )
*   **Nova Tarefa Técnica (Frontend - Polimento):**
    *   **Título:** `[FE] Polimento Básico da UI/UX`
    *   **Descrição:** Rever os fluxos principais (registo, login, adicionar item/receita, pedir receita IA) e garantir que são minimamente utilizáveis e compreensíveis. Aplicar estilos Tailwind CSS consistentes.
    *   **Checklist:**
        *   `[ ] [FE] Navegação clara entre as secções principais.`
        *   `[ ] [FE] Feedback visual básico para ações do utilizador (ex: mensagens de sucesso/erro).`
        *   `[ ] [FE] Consistência visual mínima.`

**Entregável do Sprint 3 (MVP Final):**
*   Todas as funcionalidades dos Sprints 1 e 2.
*   Utilizadores conseguem solicitar e visualizar receitas personalizadas geradas pela API Gemini.
*   Logging e testes unitários mínimos implementados.
*   Documentação essencial e UI minimamente polida.

---

### Considerações de Realismo e Simplificações para Incluir IA:

1.  **Gestão de Despensa/Receitas:** As funcionalidades de *filtrar e ordenar* (`US2.3`, `US3.2`) e *recomendações baseadas em regras* (`US4.1`, `US4.2`, `US4.3`) são sacrificadas ou adiadas para focar na IA. A IA *torna-se* o motor de recomendação principal.
2.  **Preferências do Utilizador (US5.1, US5.2):** Provavelmente ficarão de fora. O input para a IA (dieta, cozinha) será feito diretamente no formulário de pedido da receita IA, sem persistência de preferências.
3.  **Complexidade da UI para a IA:** Manter a interface para pedir receitas à IA o mais simples possível.
4.  **Tratamento de Erros da IA:** O tratamento de erros da API Gemini será básico (ex: "Não foi possível gerar a receita neste momento").
5.  **Testes e Documentação:** Serão o mínimo indispensável para cumprir os requisitos do projeto e garantir funcionalidade básica.

### Plano de Trabalho Sugerido por Ponto Focal (adaptado):

*   **João Cardoso (Dados, Infraestrutura, Backend Core):**
    *   Sprint 1: Foco total em US6.1, US6.3, US6.4. Suporte no backend para autenticação.
    *   Sprint 2: Backend para Despensa e Receitas Manuais. Setup inicial da API Gemini.
    *   Sprint 3: Suporte no backend para a lógica de chamada à Gemini. Documentação técnica (modelo de dados, arquitetura).

*   **Santiago (Backend API, Lógica de Negócio, Segurança):**
    *   Sprint 1: Foco total nos endpoints de autenticação FastAPI (US1.1, US1.2, US1.4), JWT (US1.3), Segurança (US6.8).
    *   Sprint 2: Endpoints para Despensa e Receitas Manuais.
    *   Sprint 3: Implementação da lógica de interação com a Gemini no endpoint `/ai/custom-recipes` (US4.4). Testes unitários críticos.

*   **Jessiellen (Frontend UI/UX, Experiência do Utilizador):**
    *   Sprint 1: Configuração Next.js (US6.2), páginas de Registo/Login/Logout (US1.1, US1.2, US1.5), integração NextAuth.js.
    *   Sprint 2: Páginas e formulários para Despensa e Receitas Manuais.
    *   Sprint 3: UI para solicitar receita à IA (US4.4). Polimento geral da UI/UX.

Este plano é muito apertado. A equipa precisará de ser extremamente focada, comunicar constantemente e estar preparada para fazer ajustes e simplificações adicionais à medida que avançam.