# Project Brief: PlanEats (Projeto II - Programação Web 23-25)

*This document outlines the core requirements and goals of the project, based on "Project Briefing 1.1.docx".*

## 1. Contexto do Projeto e Introdução

-   **Curso/Módulo**: Programação Web 23-25, Módulo: Projeto II
-   **Instituição**: ETIC Algarve - Escola de Tecnologias, Inovação e Criação do Algarve
-   **Equipa (Grupo 1)**: João Cardoso (Owner), Santiago, Jessiellen
-   **Origem do Projeto**: Transformar o pitch "PlanEats" (desenvolvido no módulo de "Pitching e Empreendedorismo", acessível em [https://my.visme.co/view/n01nwewm-planeats-pitch#s1](https://my.visme.co/view/n01nwewm-planeats-pitch#s1)) num Produto Mínimo Viável (MVP) funcional.
-   **Breve Descrição**: PlanEats é idealizado como uma aplicação web para gestão abrangente de despensa e recomendação de receitas. O sistema tem como objetivo ajudar os utilizadores a gerir o seu inventário alimentar, reduzir o desperdício e descobrir receitas com base nos ingredientes disponíveis e preferências pessoais, incorporando IA para a geração de receitas personalizadas.

## 2. Objetivo Geral do Projeto
Desenvolver um MVP com base no pitch previamente realizado, integrando uma proposta de valor empresarial com uma implementação técnica robusta. Isto envolve transformar o conceito inicial numa aplicação funcional que aborde tanto aspetos técnicos como de negócio.

## 3. Objetivos Específicos
-   Transformar o pitch do PlanEats num MVP, considerando tanto os aspetos técnicos como os de negócio.
-   Definir requisitos técnicos claros, incluindo componentes de UI, frontend, backend e arquitetura.
-   Desenvolver um MVP funcional da aplicação PlanEats.
-   Preparar e entregar uma apresentação final do projeto que explique e demonstre o MVP desenvolvido.
-   Definir claramente o conceito de negócio: o problema que o PlanEats resolve, o público-alvo e as funcionalidades 'core'.
-   Garantir que todos os membros da equipa contribuem para o desenvolvimento técnico, documentação e apresentação final.

## 4. Definição do Âmbito do MVP (Entregável Chave)
Um requisito central é a definição do âmbito do MVP. Isto envolverá:
-   Uma comparação detalhada entre as funcionalidades propostas no pitch original do PlanEats e aquelas que o grupo irá implementar para o MVP.
-   Identificar claramente as funcionalidades 'core' essenciais para o MVP.
-   Documentar potenciais melhorias futuras ou funcionalidades para além do MVP.
-   (Este âmbito detalhado fará parte de um "Documento de Âmbito do Projeto" separado).

## 5. Funcionalidades Chave (a definir no âmbito do MVP)
As seguintes funcionalidades, derivadas do conceito inicial do PlanEats, serão avaliadas para inclusão no MVP:
-   **Autenticação de Utilizadores**: Registo, login (baseado em JWT).
-   **Gestão de Despensa**: Adicionar, listar, atualizar, eliminar itens (nome, quantidade, unidade, data de validade, data de compra, calorias). Opções de filtragem/ordenação.
-   **Gestão de Receitas**: Listar receitas, ver detalhes (instruções, ingredientes, calorias, tempo de preparação, imagem). Adicionar receitas criadas pelo utilizador. Opções de filtragem.
-   **Recomendações de Receitas**: Com base nos itens da despensa, com filtros (calorias, ingredientes a expirar).
-   **Receitas Personalizadas com IA**: Integração com a API Gemini para solicitar receitas personalizadas.
-   **Preferências do Utilizador**: Definir e atualizar objetivos e restrições alimentares.

## 6. Conceito de Negócio
-   **Definição do Problema**: Abordar problemas comuns como o desperdício alimentar, dificuldade no planeamento de refeições com os ingredientes disponíveis e gestão de preferências alimentares.
-   **Solução Proposta**: O PlanEats oferece uma plataforma integrada para gestão de despensa e descoberta inteligente de receitas.
-   **Público-Alvo**: Indivíduos e agregados familiares que procuram organizar a sua despensa, reduzir o desperdício alimentar, descobrir receitas e gerir objetivos alimentares.
-   **Funcionalidades Centrais**: As funcionalidades essenciais que entregam a proposta de valor primária (a serem detalhadas no âmbito do MVP).

## 7. Stack Tecnológica
-   **Frontend**: Next.js (React), TypeScript/JavaScript, Tailwind CSS, React Context API, Fetch API.
-   **Backend**: FastAPI (Python), SQLModel, Alembic (migrações), Pydantic.
-   **Base de Dados**: PostgreSQL.
-   **Componente de IA**: API Gemini (integração via backend).
-   **DevOps & Ferramentas**:
    -   Controlo de Versões: Git (obrigatório, com Git Tags para as versões).
    -   Contentorização: Docker e Docker Compose (obrigatório para desenvolvimento e testes).
    -   (Terraform & Kubernetes: Considerado um diferencial, não obrigatório para este projeto).
    -   Testes: Testes unitários (obrigatório).
    -   Logging: Implementação de registo de logs (obrigatório).

## 8. Arquitetura do Sistema
-   **Modelo**: Cliente-Servidor.
-   **Frontend (Cliente)**: Aplicação Next.js.
-   **Backend (Servidor)**: Aplicação FastAPI.
-   **Base de Dados**: PostgreSQL.
-   **Componente de IA**: API Gemini.
-   **Comunicação**: API RESTful (JSON).
-   (Um diagrama de arquitetura robusto que descreva as interações dos módulos e o fluxo de dados é um entregável obrigatório).

## 9. Medidas de Segurança
-   Autenticação baseada em JWT.
-   Hashing de passwords (bcrypt/Argon2 via passlib).
-   HTTPS (para consciencialização sobre produção, embora o foco principal seja o desenvolvimento local).
-   Validação de entradas (Pydantic no backend, validação no frontend).
-   Considerações sobre proteção CSRF.
-   Gestão segura de segredos (variáveis de ambiente, ficheiro .env para Docker Compose).
-   Atualizações regulares de dependências.

## 10. Fases do Projeto e Cronograma
O projeto seguirá a estrutura definida no "Enunciado":
-   **Fase 1: Definição do Âmbito e Planeamento (Aprox. 3 sessões)**:
    -   Entregáveis: Documento de Âmbito do Projeto, Definição de Papéis e Tarefas, Plano Técnico, Design Inicial da Interface (Figma/outra ferramenta), Estrutura Inicial da Apresentação.
-   **Fase 2: Desenvolvimento (Aprox. 11 sessões, sessões 4-14)**:
    -   Entregáveis: Solução/Demo Funcional (desenvolvimento iterativo), Documentação Atualizada, Testes Regulares e Feedback, Apresentação Aperfeiçoada.
    -   Questionário Intercalar (entre as sessões 7 e 9).
-   **Fase 3: Apresentação Final (Sessão 15 – 4 Horas)**:
    -   Entregáveis: Apresentação Final, Demonstração ao Vivo do MVP, Perguntas e Respostas (Q&A).

## 11. Entregáveis Chave
-   Documento de Âmbito do Projeto: Detalhando objetivos técnicos/de negócio, resumo do pitch, âmbito do MVP vs. pitch, e melhorias.
-   Definição da Interface da Solução: Evidência do design da UI (Figma).
-   Documentação Técnica: Incluindo instruções de instalação e manutenção.
-   Documento de Modelo de Dados, Contentorização e Arquitetura.
-   Aplicação MVP Funcional.
-   Repositório Público no GitHub: Gerido pelo grupo, com Git Tags claras para as versões.
-   Apresentação Final e Demonstração ao Vivo.
-   Questionário Intercalar Preenchido.

## 12. Critérios de Avaliação (Resumo)
-   **Avaliação do Grupo (20%)**: Entregáveis (5%), Colaboração em Equipa (15%).
-   **Avaliação do Projeto (40%)**: Apresentação (15%), Implementação Técnica (25%).
-   **Avaliação Individual (10%)**: Contribuição pessoal, comparativo tarefas/entregues, impacto, responsabilidade, participação, Q&A.
-   (Nota: A avaliação total parece ser de 70% com base nestas secções, os restantes 30% provavelmente de outros componentes).

## 13. Critérios de Sucesso
-   Entrega bem-sucedida de um MVP funcional para o PlanEats alinhado com o âmbito definido.
-   Cumprimento de todos os requisitos académicos e entregáveis.
-   Apresentação final clara, profissional e demonstração funcional.
-   Trabalho de equipa eficaz e contribuição individual significativa.
-   Implementação técnica robusta com boas práticas.

## 14. Pontos Focais de Área e Colaboração (Resumo de "Definição de Pontos Focais...")

**Filosofia de Papéis**: Colaborativa, com "Pontos Focais de Área" para dinamizar progresso, coerência e qualidade.

**Pontos Focais de Área (Papéis Flexíveis)**:
-   **João Cardoso – Ponto Focal para Dados e Infraestrutura Inicial (DevOps Foundation)**
    -   **Responsabilidade Primária**: Base de dados PostgreSQL (design, modelos SQLAlchemy, CRUD, migrações Alembic). Infraestrutura de conteinerização inicial (Dockerfiles base BD, docker-compose.yml). Gestão Git.
    -   **Colaboração**: Com Santiago (API data needs), apoio à equipa (BD, Docker/Git), pode contribuir para API/frontend. Coordenador documentação técnica geral.
-   **Santiago – Ponto Focal para Backend (API) e Lógica de Negócio**
    -   **Responsabilidade Primária**: API backend FastAPI (funcionalidade, segurança, eficiência, lógica de negócio, endpoints, routers, schemas Pydantic). Segurança API, integração Gemini, testes unitários backend.
    -   **Colaboração**: Com João (interações BD, otimização queries), com Jessiellen (contratos API, Swagger). Pode contribuir para camada de dados/frontend. Apoio Dockerfile backend.
-   **Jessiellen – Ponto Focal para Frontend (UI/UX) e Experiência do Utilizador**
    -   **Responsabilidade Primária**: Interface Next.js (React, TypeScript, Tailwind CSS) intuitiva, funcional, estética (conforme Figma), comunicação backend eficaz. Componentes frontend reutilizáveis, gestão de estado cliente, testes frontend. Experiência do utilizador, responsividade, documentação orientada ao utilizador.
    -   **Colaboração**: Com Santiago (API data needs), pode solicitar apoio para lógica complexa/fluxo de dados. Apoio Dockerfile frontend. Pode contribuir para design API/testes backend.

**Responsabilidades Chave da Equipa (Abordagem Colaborativa)**:
-   **Conteinerização e Ambiente DevOps (Dockerfiles, docker-compose.yml)**:
    -   Coordenação Inicial e docker-compose.yml: João Cardoso.
    -   Dockerfiles dos Serviços: Cada Ponto Focal (João-BD, Santiago-Backend, Jessiellen-Frontend) responsável pelo seu, com apoio.
-   **Documentação Técnica Geral (Âmbito, Arquitetura, etc.)**:
    -   Coordenação/Consolidação: João Cardoso.
    -   Contribuição: Todos.
-   **Testes (Unitários, Componentes, Integração)**:
    -   Unitários/Componentes: Cada Ponto Focal coordena para sua camada.
    -   Integração: Responsabilidade conjunta.
-   **Segurança da Aplicação**:
    -   Dinamização API & Geral: Santiago.
    -   Contribuições Ativas: Todos.
-   **Gestão do Repositório Git e Controlo de Versões**:
    -   Dinamização e Manutenção: João Cardoso.
    -   Práticas: Definidas e seguidas por todos.
-   **Revisão de Código**: Decisão da equipa.
-   **Comunicação e Sincronização**: Responsabilidade de todos.
