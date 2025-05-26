# System Patterns

*This document outlines the system architecture, key technical decisions, design patterns in use, component relationships, and critical implementation paths, based on "Arquitetura do Sistema.docx".*

## Visão Geral

Adotada uma arquitetura **client-server**, separando responsabilidades da interface do utilizador (frontend) e da lógica de negócio/acesso a dados (backend). Esta abordagem promove modularidade, escalabilidade e manutenibilidade.

## Componentes da Arquitetura

1.  **Frontend (Cliente)**:
    *   **Tecnologia**: Next.js (React).
    *   **Responsabilidades**: Apresentação da interface ao utilizador, captura de inputs, comunicação com o backend via API.

2.  **Backend (Servidor)**:
    *   **Tecnologia**: FastAPI (Python).
    *   **Responsabilidades**: Processar requisições do frontend, aplicar lógica de negócio (incluindo interação com IA para receitas), gerir autenticação/autorização, interagir com a base de dados.

3.  **Base de Dados**:
    *   **Tecnologia**: PostgreSQL.
    *   **Responsabilidades**: Persistir todos os dados da aplicação (utilizadores, itens da despensa, receitas, etc.).

4.  **Componente de IA**:
    *   **Responsabilidades**: Gerar recomendações de receitas. Considera itens na despensa, datas de validade, calorias, e restrições/objetivos do utilizador.
    *   **Implementação**: Poderá ser uma biblioteca Python integrada no backend FastAPI ou um serviço externo invocado pelo backend.

## Fluxo de Comunicação

1.  O utilizador interage com a interface Next.js no seu navegador.
2.  O frontend Next.js envia pedidos HTTP (e.g., GET, POST, PUT, DELETE) para o backend FastAPI.
3.  O backend FastAPI processa os pedidos:
    *   Valida os dados de entrada.
    *   Interage com a base de dados PostgreSQL para ler ou escrever dados.
    *   Se necessário, invoca o componente de IA para obter recomendações de receitas.
    *   Aplica a lógica de negócio.
4.  O backend FastAPI envia uma resposta HTTP (geralmente em formato JSON) de volta para o frontend.
5.  O frontend Next.js atualiza a interface do utilizador com base na resposta recebida.

## Considerações Adicionais

*   **API**: A comunicação entre o frontend e o backend será feita através de uma API RESTful bem definida. FastAPI será usado para a criação automática de documentação (Swagger UI/OpenAPI).
*   **Modularidade**: A separação entre frontend e backend permite que as equipas trabalhem de forma independente em cada componente.

*(Nota: O documento original menciona um "Diagrama Simplificado" que não foi fornecido no texto extraído. Este será um entregável obrigatório do projeto.)*

## Autenticação e Segurança (Visão Geral de "Fluxo Autenticação e Segurança 2.0.docx")

-   **Arquitetura de Autenticação**: Híbrida.
    -   **Frontend**: Next.js com NextAuth.js (gestão de sessões, integração com providers, armazenamento seguro de tokens, proteção de rotas, renovação de sessões).
    -   **Backend**: FastAPI com JWT (validação de tokens, proteção de endpoints, gestão de utilizadores com SQLModel, geração de tokens).
-   **Fluxo de Autenticação**:
    1.  **Registo**: Frontend (NextAuth.js form) -> Backend (`/auth/register`, validação Pydantic/SQLModel, hash password com passlib, armazena user).
    2.  **Login**: Frontend (NextAuth.js com providers Credentials, OAuth Google/GitHub) -> Backend (`/auth/login`, valida credenciais, gera JWT).
    3.  **Gestão de Sessões**: NextAuth.js (JWT em cookies HttpOnly/Secure, renovação, hooks `useSession`/`getSession`).
    4.  **Proteção de Rotas**: Middleware NextAuth.js (frontend), FastAPI dependencies com JWT (backend).
    5.  **Requisições Autenticadas**: NextAuth.js adiciona tokens aos headers -> Backend valida JWT.
    6.  **Logout**: NextAuth.js `signOut()` -> Backend invalida token (opcional blocklist).
-   **Medidas de Segurança Chave**:
    -   Hashing de Passwords (passlib - bcrypt/Argon2).
    -   Comunicação Segura (HTTPS).
    -   Validação de Dados (React Hook Form + Zod no frontend, Pydantic/SQLModel no backend).
    -   Proteção CSRF e XSS (NextAuth.js, cookies HttpOnly/Secure/SameSite, CSP).
    -   Rate Limiting (slowapi no backend).
    -   Gestão Segura de Segredos (`.env` files, Docker Secrets).
    -   Configuração CORS (FastAPI middleware).
    -   SQLModel para queries seguras (proteção SQL Injection, parametrização).
    -   Logging e Monitorização.
