# Tech Context

*This document details the technologies used, development setup, technical constraints, dependencies, and tool usage patterns, based on "Tech Stack 2.0.docx".*

## Frontend

-   **Framework Principal**: Next.js
    -   **Justificação**: Framework React robusta para SSR e SSG, otimizando desempenho e SEO. Simplifica routing e melhora a experiência de desenvolvimento.
-   **Linguagem**: JavaScript/TypeScript
    -   **Justificação**: TypeScript recomendado para tipagem estática, melhorando robustez e manutenibilidade.
-   **Estilização**: Tailwind CSS
    -   **Justificação**: Framework CSS "utility-first" para construir interfaces personalizadas rapidamente. Promove consistência e acelera desenvolvimento da UI.
-   **Gestão de Estado (Condicional)**: React Context API
    -   **Justificação**: Para estados globais simples ou partilha de estado, evitando complexidade de bibliotecas como Redux. Usado conforme necessidade.
-   **Cliente HTTP**: Fetch API
    -   **Justificação**: Para realizar chamadas à API do backend.

## Backend

-   **Framework Principal**: FastAPI
    -   **Justificação**: Framework web moderna e de alto desempenho para APIs com Python 3.7+. Oferece tipagem (Pydantic), validação automática, documentação interativa (Swagger UI, ReDoc).
-   **Linguagem**: Python
    -   **Justificação**: Popular, vasta gama de bibliotecas, forte em Data Science e Machine Learning (benéfico para IA de receitas).
-   **ORM/Interação com Base de Dados**: SQLAlchemy (com Alembic para migrações)
    -   **Justificação**: SQLAlchemy é um ORM poderoso e flexível. Alembic para migração de bases de dados.
-   **Validação de Dados**: Pydantic (integrado no FastAPI)
    -   **Justificação**: Definir modelos de dados e realizar validações, garantindo integridade dos dados.

## Base de Dados

-   **Sistema de Gestão de Base de Dados (SGBD)**: PostgreSQL
    -   **Justificação**: SGBD relacional objeto-relacional poderoso, open-source, conhecido pela fiabilidade, robustez e extensibilidade.

## Componente de IA

-   **Integração**: API Gemini
    -   **Justificação**: Capacidades avançadas de processamento e recomendação de refeições. Gera planos personalizados considerando restrições e preferências. Permite escalar processamento de dados com alta performance sem desenvolver modelo próprio.

## Outras Ferramentas

-   **Controlo de Versões**: Git (com repositório no GitHub, conforme especificado no documento do projeto).
-   **Containerização**: Docker e Docker Compose (obrigatório conforme o documento do projeto).

*Esta stack tecnológica foi escolhida para equilibrar modernidade, desempenho, facilidade de desenvolvimento e os requisitos do projeto, incluindo a integração de IA.*

## Estratégia de Containerização (Baseado em "Estratégia de Containerização.docx")

**Visão Geral**: Docker e Docker Compose são obrigatórios para simplificar o ambiente de desenvolvimento, garantir consistência e facilitar deployment. Containers para frontend (Next.js), backend (FastAPI) e base de dados (PostgreSQL).

### Dockerfiles

**Dockerfile para Frontend (Next.js)**:
-   **Localização**: Raiz do projeto frontend.
-   **Base Image**: `node:18-alpine` ou `node:20-alpine`.
-   **Fases**:
    1.  `builder` stage: Instala dependências, copia código, `npm run build`.
    2.  Final stage: Copia artefactos do `builder` (`.next`, `public`, `package.json`, `next.config.js`), expõe porta 3000, `CMD ["npm", "start"]`.
-   **Exemplo Resumido**:
    ```dockerfile
    # Builder stage
    FROM node:18-alpine AS builder
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build

    # Final stage
    FROM node:18-alpine
    WORKDIR /usr/src/app
    COPY --from=builder /usr/src/app/.next ./.next
    COPY --from=builder /usr/src/app/public ./public
    COPY --from=builder /usr/src/app/package.json ./package.json
    COPY --from=builder /usr/src/app/next.config.js ./next.config.js
    EXPOSE 3000
    CMD ["npm", "start"]
    ```

**Dockerfile para Backend (FastAPI)**:
-   **Localização**: Raiz do projeto backend.
-   **Base Image**: `python:3.9-slim` ou `python:3.10-slim`.
-   **Conteúdo**: Define `WORKDIR /app`, `ENV PYTHONUNBUFFERED 1`, copia `requirements.txt`, `pip install`, copia código, expõe porta 8000, `CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`.
-   **Exemplo Resumido**:
    ```dockerfile
    FROM python:3.9-slim
    WORKDIR /app
    ENV PYTHONUNBUFFERED 1
    COPY ./requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    COPY . .
    EXPOSE 8000
    CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    ```

### `docker-compose.yml`
-   **Serviços**:
    -   `frontend`:
        -   `build`: Contexto `./frontend`, `dockerfile: Dockerfile`.
        -   `ports`: `"3000:3000"`.
        -   `volumes`: `./frontend:/usr/src/app`, `/usr/src/app/node_modules`, `/usr/src/app/.next` (para dev hot-reloading e persistência).
        -   `environment`: `NEXT_PUBLIC_API_URL=http://backend:8000`.
        -   `depends_on`: `backend`.
        -   `restart`: `unless-stopped`.
    -   `backend`:
        -   `build`: Contexto `./backend`, `dockerfile: Dockerfile`.
        -   `ports`: `"8000:8000"`.
        -   `volumes`: `./backend:/app` (para dev).
        -   `environment`: `DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`.
        -   `depends_on`: `db`.
        -   `restart`: `unless-stopped`.
    -   `db` (PostgreSQL):
        -   `image`: `postgres:13-alpine`.
        -   `ports`: `"5432:5432"`.
        -   `environment`: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (lidas de ficheiro `.env`).
        -   `volumes`: `postgres_data:/var/lib/postgresql/data/`.
        -   `restart`: `unless-stopped`.
-   **Volumes**:
    -   `postgres_data`: Volume nomeado para persistência de dados do PostgreSQL.
-   **Exemplo Resumido**:
    ```yaml
    version: '3.8'
    services:
      frontend:
        build:
          context: ./frontend
          dockerfile: Dockerfile
        ports:
          - "3000:3000"
        volumes:
          - ./frontend:/usr/src/app
          - /usr/src/app/node_modules
          - /usr/src/app/.next
        environment:
          - NEXT_PUBLIC_API_URL=http://backend:8000
        depends_on:
          - backend
        restart: unless-stopped
      backend:
        build:
          context: ./backend
          dockerfile: Dockerfile
        ports:
          - "8000:8000"
        volumes:
          - ./backend:/app
        environment:
          - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
        depends_on:
          - db
        restart: unless-stopped
      db:
        image: postgres:13-alpine
        ports:
          - "5432:5432"
        environment:
          POSTGRES_USER: ${POSTGRES_USER}
          POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
          POSTGRES_DB: ${POSTGRES_DB}
        volumes:
          - postgres_data:/var/lib/postgresql/data/
        restart: unless-stopped
    volumes:
      postgres_data:
    ```

### Ficheiro `.env`
-   Localizado na raiz do projeto (junto ao `docker-compose.yml`).
-   Armazena credenciais da BD e outras configurações sensíveis.
-   Exemplo:
    ```env
    POSTGRES_USER=seu_utilizador_db
    POSTGRES_PASSWORD=sua_password_db
    POSTGRES_DB=nome_da_sua_db
    ```

### Fluxo de Desenvolvimento
-   Construir e iniciar: `docker-compose up --build -d`.
-   Acesso Frontend: `http://localhost:3000`.
-   Acesso Backend API: `http://localhost:8000` (Swagger: `http://localhost:8000/docs`).
-   Parar containers: `docker-compose down`.

## Pre-commit Setup (Baseado em "Precommit setup.docx" e `precommit_config.txt`)

**Benefícios**:
-   **Qualidade de Código**: Linting e formatação automáticos.
-   **Segurança**: Detecção de segredos, vulnerabilidades.
-   **Consistência**: Imposição de padrões de código.
-   **Detecção Precoce**: Captura problemas antes de irem para o repositório.

**Configuração (conforme `precommit_config.txt` - assumido como `.pre-commit-config.yaml`):**

```yaml
# .pre-commit-config.yaml
repos:
  # General hooks for all files
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: detect-private-key
      - id: check-case-conflict

  # Python/FastAPI Backend hooks
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        files: ^backend/
        language_version: python3

  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        files: ^backend/
        args: ["--profile", "black"]

  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
        files: ^backend/
        args: [--max-line-length=88, --extend-ignore=E203,W503]
        # Configuração adicional em backend/.flake8

  - repo: https://github.com/pycqa/bandit
    rev: 1.7.5
    hooks:
      - id: bandit
        files: ^backend/
        args: ["-r", "-x", "tests/"]

  # TypeScript/Next.js Frontend hooks
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.56.0
    hooks:
      - id: eslint
        files: ^frontend/.*\.(js|jsx|ts|tsx)$
        additional_dependencies:
          - eslint@8.56.0
          - "@next/eslint-config-next"
          - "@typescript-eslint/parser"
          - "@typescript-eslint/eslint-plugin"
        # Configuração adicional em frontend/eslint.config.js

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v4.0.0-alpha.8
    hooks:
      - id: prettier
        files: ^frontend/.*\.(js|jsx|ts|tsx|json|css|md|yml|yaml)$
        additional_dependencies:
          - prettier@3.1.1
          - prettier-plugin-tailwindcss
        # Configuração adicional em frontend/.prettierrc

  # Docker and Docker Compose
  - repo: https://github.com/hadolint/hadolint
    rev: v2.12.0
    hooks:
      - id: hadolint-docker
        args: [--ignore, DL3008, --ignore, DL3009]

  # Security scanning
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
        exclude: package.lock.json

  # SQLModel/SQL related
  - repo: https://github.com/sqlfluff/sqlfluff
    rev: 2.3.5
    hooks:
      - id: sqlfluff-lint
        files: ^backend/.*\.sql$
      - id: sqlfluff-fix
        files: ^backend/.*\.sql$

  # Environment and configuration files
  - repo: https://github.com/adrienverge/yamllint.git
    rev: v1.33.0
    hooks:
      - id: yamllint
        args: [-d, relaxed]

# Configuration for specific tools
ci:
  autofix_commit_msg: |
    [pre-commit.ci] auto fixes from pre-commit hooks
  autofix_prs: true
  autoupdate_branch: ''
  autoupdate_commit_msg: '[pre-commit.ci] pre-commit autoupdate'
  autoupdate_schedule: weekly
  skip: []
  submodules: false
```

**Ficheiros de Configuração de Suporte (mencionados em "Precommit setup.docx")**:
-   **Python/Backend (`backend/.flake8`)**:
    ```ini
    [flake8]
    max-line-length = 88
    extend-ignore = E203, W503, E501
    exclude = 
        .git,
        __pycache__,
        .venv,
        venv,
        alembic/versions/
    per-file-ignores = 
        __init__.py:F401
    ```
-   **Frontend ESLint (`frontend/eslint.config.js`)**:
    ```javascript
    module.exports = {
      extends: [
        "next/core-web-vitals",
        "@typescript-eslint/recommended"
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "prefer-const": "error"
      }
    }
    ```
-   **Frontend Prettier (`frontend/.prettierrc`)**:
    ```json
    {
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": true,
      "printWidth": 80,
      "tabWidth": 2,
      "plugins": ["prettier-plugin-tailwindcss"]
    }
    ```

**Instruções de Setup**:
1.  Instalar pre-commit: `pip install pre-commit`
2.  Instalar hooks (cria o ambiente para os hooks definidos no `.pre-commit-config.yaml`): `pre-commit install`
3.  Correr em todos os ficheiros (recomendado na primeira vez ou após adicionar novos hooks): `pre-commit run --all-files`

**Integração com o Workflow**:
-   Assegura estilo de código consistente em todo o projeto.
-   Captura erros de linting e potenciais bugs (TypeScript, Python) antes do commit.
-   Valida a formatação e sintaxe de ficheiros de configuração (YAML, JSON).
-   Ajuda a prevenir o commit de segredos e chaves privadas.
-   Mantém boas práticas para Dockerfiles.
-   Formata e valida queries SQL.
-   A configuração `ci:` sugere integração com `pre-commit.ci` para automação em PRs.
