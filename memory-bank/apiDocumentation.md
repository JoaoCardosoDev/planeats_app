# API Documentation: PlanEats

*Based on "Documentação API 2.0.docx"*

## Introdução

Esta documentação descreve a API do serviço backend para a aplicação PlanEats, um sistema de gestão de despensa e recomendação de receitas. A API é estruturada seguindo os princípios RESTful e foi implementada utilizando o framework FastAPI em Python com SQLModel para interação com a base de dados.

## Informações Gerais

-   **Base URL**: `http://localhost:8000` (ambiente de desenvolvimento)
-   **Formato de Dados**: JSON
-   **Autenticação**: Híbrida - NextAuth.js no frontend com validação JWT no backend
-   **ORM**: SQLModel para tipagem segura e interação com PostgreSQL
-   **Validação**: Automática via Pydantic integrado com SQLModel

## Modelos de Dados (SQLModel)

### User

```python
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### PantryItem

```python
class PantryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    item_name: str
    quantity: float
    unit: str
    expiration_date: Optional[date] = None
    purchase_date: Optional[date] = None
    calories_per_unit: Optional[int] = None
    added_at: datetime = Field(default_factory=datetime.utcnow)
```

### Recipe

```python
class Recipe(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    recipe_name: str
    instructions: str
    estimated_calories: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    created_by_user_id: Optional[int] = Field(foreign_key="user.id")
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## Endpoints

### Autenticação

#### Registo de Utilizador
-   **Endpoint**: `POST /auth/register`
-   **Descrição**: Cria uma nova conta de utilizador compatível com NextAuth.js.
-   **Corpo do Pedido**:
    ```json
    {
      "email": "exemplo@email.com",
      "password": "password123",
      "username": "nomeutilizador"
    }
    ```
-   **Resposta com Sucesso (201 Created)**:
    ```json
    {
      "id": 1,
      "email": "exemplo@email.com",
      "username": "nomeutilizador",
      "is_active": true,
      "created_at": "2025-05-13T12:00:00Z"
    }
    ```

#### Login de Utilizador
-   **Endpoint**: `POST /auth/login`
-   **Descrição**: Autentica um utilizador para integração com NextAuth.js.
-   **Corpo do Pedido**:
    ```json
    {
      "email": "exemplo@email.com",
      "password": "password123"
    }
    ```
-   **Resposta com Sucesso (200 OK)**:
    ```json
    {
      "id": 1,
      "email": "exemplo@email.com",
      "username": "nomeutilizador",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer"
    }
    ```

#### Validação de Token (NextAuth.js)
-   **Endpoint**: `POST /auth/verify-token`
-   **Descrição**: Endpoint para NextAuth.js validar tokens JWT.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Resposta com Sucesso (200 OK)**:
    ```json
    {
      "id": 1,
      "email": "exemplo@email.com",
      "username": "nomeutilizador",
      "is_active": true
    }
    ```

### Gestão de Despensa

#### Listar Itens da Despensa
-   **Endpoint**: `GET /pantry/items`
-   **Descrição**: Retorna todos os itens da despensa do utilizador autenticado usando SQLModel.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Parâmetros de Consulta (opcionais)**:
    -   `expiring_soon` (boolean): Filtrar por itens prestes a expirar
    -   `sort_by` (string): Campo para ordenação ("expiration_date", "name", "added_at")
    -   `sort_order` (string): Ordem de classificação ("asc" ou "desc")
    -   `limit` (integer): Número máximo de itens a retornar
    -   `offset` (integer): Número de itens a saltar (paginação)
-   **Resposta com Sucesso (200 OK)**: (Exemplo no documento original)

#### Adicionar Item à Despensa
-   **Endpoint**: `POST /pantry/items`
-   **Descrição**: Adiciona um novo item à despensa com validação SQLModel.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Corpo do Pedido**: (Exemplo no documento original)
-   **Resposta com Sucesso (201 Created)**: (Exemplo no documento original)

#### Atualizar Item da Despensa
-   **Endpoint**: `PUT /pantry/items/{item_id}`
-   **Descrição**: Atualiza parcialmente um item da despensa usando SQLModel.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Corpo do Pedido (campos opcionais)**: (Exemplo no documento original)
-   **Resposta com Sucesso (200 OK)**: (Exemplo no documento original)

#### Eliminar Item da Despensa
-   **Endpoint**: `DELETE /pantry/items/{item_id}`
-   **Descrição**: Remove um item específico da despensa.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Resposta com Sucesso**: 204 No Content

### Receitas

#### Listar Receitas
-   **Endpoint**: `GET /recipes`
-   **Descrição**: Retorna receitas com filtragem avançada via SQLModel.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Parâmetros de Consulta (opcionais)**: (Listados no documento original)
-   **Resposta com Sucesso (200 OK)**: (Exemplo no documento original)

#### Obter Detalhes da Receita
-   **Endpoint**: `GET /recipes/{recipe_id}`
-   **Descrição**: Retorna detalhes completos incluindo ingredientes via relações SQLModel.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Resposta com Sucesso (200 OK)**: (Exemplo no documento original, incluindo lista de ingredientes)

#### Adicionar Receita
-   **Endpoint**: `POST /recipes`
-   **Descrição**: Cria uma nova receita com validação SQLModel.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Corpo do Pedido**: (Exemplo no documento original, incluindo lista de ingredientes)
-   **Resposta com Sucesso (201 Created)**: (Exemplo no documento original)

### Recomendações de Receitas

#### Obter Recomendações
-   **Endpoint**: `GET /recommendations`
-   **Descrição**: Sistema de recomendações melhorado com análise SQLModel.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Parâmetros de Consulta (opcionais)**: (Listados no documento original)
-   **Resposta com Sucesso (200 OK)**: (Exemplo no documento original, detalhando `matching_ingredients`, `missing_ingredients`, etc.)

### Integração com IA (Gemini)

#### Solicitar Receita Personalizada via IA
-   **Endpoint**: `POST /ai/custom-recipes`
-   **Descrição**: Gera receitas personalizadas usando Gemini API com dados SQLModel.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Corpo do Pedido**: (Exemplo no documento original, incluindo `pantry_item_ids`, `dietary_restrictions`, etc.)
-   **Resposta com Sucesso (200 OK)**: (Exemplo no documento original, detalhando `generated_recipe`, `used_pantry_items`, `generation_metadata`)

#### Salvar Receita Gerada pela IA
-   **Endpoint**: `POST /ai/custom-recipes/{generation_id}/save`
-   **Descrição**: Salva uma receita gerada pela IA na base de dados.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Resposta com Sucesso (201 Created)**: (Exemplo no documento original)

### Preferências do Utilizador

#### Obter Preferências
-   **Endpoint**: `GET /user/preferences`
-   **Descrição**: Retorna preferências com tipagem SQLModel.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Resposta com Sucesso (200 OK)**: (Exemplo no documento original)

#### Atualizar Preferências
-   **Endpoint**: `PUT /user/preferences`
-   **Descrição**: Atualização com validação SQLModel automática.
-   **Cabeçalhos**: `Authorization: Bearer {token}`
-   **Corpo do Pedido**: (Exemplo no documento original)
-   **Resposta com Sucesso (200 OK)**: (Exemplo no documento original)

## Códigos de Erro

| Código | Descrição                                       |
| :----- | :---------------------------------------------- |
| 400    | Pedido inválido (dados incorretos ou em falta)  |
| 401    | Não autorizado (token inválido ou expirado)     |
| 403    | Proibido (sem permissões para aceder ao recurso)|
| 404    | Recurso não encontrado                          |
| 422    | Erro de validação (SQLModel/Pydantic)           |
| 429    | Rate limit excedido                             |
| 500    | Erro interno do servidor                        |
| 503    | Serviço indisponível (ex: Gemini API offline)   |

*(Exemplos de erros detalhados no documento original)*

## Notas de Implementação

-   **SQLModel Features**: Tipagem automática, relações, migrações (Alembic), performance (lazy loading).
-   **NextAuth.js Integration**: Session handling, multiple providers, security (HttpOnly cookies, CSRF), refresh tokens.
-   **Gemini API Integration**: Rate limiting, error handling, cost optimization, content filtering.

*Esta API oferece uma base robusta para a aplicação PlanEats.*

## Estrutura da Base de Dados (PostgreSQL)

*Baseado em "Estrutura de base de dados.docx"*

### Visão Geral
A base de dados será implementada em PostgreSQL. O esquema abaixo define as tabelas principais, os seus campos e relações.

### Definição das Tabelas

#### Users
-   `user_id` (SERIAL, PRIMARY KEY): Identificador único do utilizador.
-   `email` (VARCHAR(255), UNIQUE, NOT NULL): Email do utilizador (usado para login).
-   `password_hash` (VARCHAR(255), NOT NULL): Hash da password do utilizador.
-   `username` (VARCHAR(100)): Nome de exibição do utilizador (opcional).
-   `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP): Data e hora de criação da conta.

#### PantryItems
-   `item_id` (SERIAL, PRIMARY KEY): Identificador único do item na despensa.
-   `user_id` (INTEGER, NOT NULL, REFERENCES users(user_id) ON DELETE CASCADE): ID do utilizador a quem o item pertence.
-   `item_name` (VARCHAR(255), NOT NULL): Nome do item.
-   `quantity` (NUMERIC(10, 2), NOT NULL): Quantidade do item.
-   `unit` (VARCHAR(50), NOT NULL): Unidade de medida.
-   `expiration_date` (DATE): Data de validade do item.
-   `purchase_date` (DATE, DEFAULT CURRENT_DATE): Data de compra do item.
-   `calories_per_unit` (INTEGER): Calorias aproximadas por unidade.
-   `added_at` (TIMESTAMP WITH TIME ZONE, DEFAULT CURRENT_TIMESTAMP): Data e hora de adição do item.

#### Recipes
-   `recipe_id` (SERIAL, PRIMARY KEY): Identificador único da receita.
-   `recipe_name` (VARCHAR(255), NOT NULL): Nome da receita.
-   `instructions` (TEXT, NOT NULL): Instruções de preparação.
-   `estimated_calories` (INTEGER): Total de calorias estimadas.
-   `preparation_time_minutes` (INTEGER): Tempo estimado de preparação em minutos.
-   `created_by_user_id` (INTEGER, NULL, REFERENCES users(user_id) ON DELETE SET NULL): ID do utilizador que criou a receita (NULL para receitas do sistema).
-   `image_url` (VARCHAR(255)): URL para uma imagem da receita.

#### RecipeIngredients
-   `recipe_ingredient_id` (SERIAL, PRIMARY KEY): Identificador único da ligação ingrediente-receita.
-   `recipe_id` (INTEGER, NOT NULL, REFERENCES recipes(recipe_id) ON DELETE CASCADE): ID da receita.
-   `ingredient_name` (VARCHAR(255), NOT NULL): Nome do ingrediente.
-   `required_quantity` (NUMERIC(10, 2), NOT NULL): Quantidade necessária.
-   `required_unit` (VARCHAR(50), NOT NULL): Unidade de medida para a quantidade.

#### UserPreferences
-   `preference_id` (SERIAL, PRIMARY KEY): Identificador único da preferência.
-   `user_id` (INTEGER, UNIQUE, NOT NULL, REFERENCES users(user_id) ON DELETE CASCADE): ID do utilizador.
-   `daily_calorie_goal` (INTEGER): Objetivo de calorias diárias.
-   `dietary_restrictions` (TEXT[]): Array de strings para restrições (e.g., `{"vegetariano", "sem glúten"}`).
-   `other_preferences` (JSONB): Para armazenar outras preferências (e.g., tipo de cozinha).

### Relações
-   Um `User` pode ter muitos `PantryItems`.
-   Um `User` pode ter uma entrada em `UserPreferences` (UNIQUE em `user_id`).
-   Um `User` pode criar muitas `Recipes`.
-   Uma `Recipe` pode ter muitos `RecipeIngredients`.

### Considerações Adicionais
-   **Índices**: Serão criados em colunas frequentemente usadas em `WHERE` ou `JOIN`.
-   **Migrações**: Geridas com Alembic.
-   **Normalização**: Equilíbrio entre normalização e desempenho.
-   *Este esquema é a base para o MVP e pode evoluir.*

## Detalhes de Autenticação e Segurança (de "Fluxo Autenticação e Segurança 2.0.docx")

### Arquitetura de Autenticação
-   **Frontend (Next.js com NextAuth.js)**:
    -   Gestão de sessões do utilizador.
    -   Integração com providers: Credentials, Google, GitHub.
    -   Armazenamento seguro de tokens em cookies HttpOnly.
    -   Proteção automática de rotas.
    -   Renovação automática de sessões.
-   **Backend (FastAPI com JWT)**:
    -   Validação de tokens JWT.
    -   Proteção de endpoints da API.
    -   Gestão de dados de utilizadores com SQLModel.
    -   Geração de tokens personalizados.

### Fluxo de Autenticação Detalhado
1.  **Registo de Utilizador**:
    -   Frontend: NextAuth.js form (provider "credentials").
    -   Backend (`/auth/register`): Valida (Pydantic/SQLModel), hash password (passlib: bcrypt/Argon2), armazena user (SQLModel), retorna dados do user.
2.  **Login de Utilizador**:
    -   Frontend: NextAuth.js (Credentials, OAuth: Google, GitHub).
    -   Backend (`/auth/login`): Valida credenciais, verifica hash, gera JWT, retorna token para NextAuth.js.
3.  **Gestão de Sessões**:
    -   NextAuth.js: JWT em cookies HttpOnly e Secure, renovação automática, hooks (`useSession`, `getSession`).
4.  **Proteção de Rotas**:
    -   Frontend: Middleware NextAuth.js.
    -   Backend: FastAPI dependencies (verificam JWT).
5.  **Requisições Autenticadas**:
    -   Frontend: NextAuth.js adiciona tokens aos headers.
    -   Backend: Middleware FastAPI valida JWT, extrai dados do user. (Headers: `Authorization: Bearer <token>` ou cookies).
6.  **Logout**:
    -   Frontend: `signOut()` do NextAuth.js.
    -   Backend: Token invalidado (blocklist opcional).

### Configuração Técnica (Exemplos de Código)
-   **NextAuth.js Configuration** (`pages/api/auth/[...nextauth].js`):
    -   `providers`: `CredentialsProvider` (com chamada ao backend FastAPI para `authorize`), `GoogleProvider`.
    -   `session`: strategy "jwt", `maxAge: 24 * 60 * 60`.
    -   `callbacks`: `jwt` (adiciona `access_token`), `session` (adiciona `accessToken` à session).
-   **FastAPI Authentication**:
    -   `get_current_user` dependency: Valida token JWT, busca user com SQLModel.

### Medidas de Segurança Específicas
-   **Hashing de Passwords**: Backend (passlib com bcrypt/Argon2), SQLModel armazena hashes.
-   **Comunicação Segura**: HTTPS obrigatório em produção.
-   **Validação de Dados**:
    -   Frontend: React Hook Form + Zod.
    -   Backend: Pydantic (integrado no SQLModel), constraints de BD.
-   **Proteção CSRF e XSS**:
    -   NextAuth.js: Proteção CSRF automática.
    -   Cookies: HttpOnly, Secure, SameSite.
    -   Headers: Content Security Policy.
-   **Rate Limiting**: Backend (slowapi com FastAPI).
-   **Gestão de Segredos**:
    -   Frontend: `.env.local` (NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, etc.).
    -   Backend: `.env` (SECRET_KEY, DATABASE_URL).
-   **Configuração CORS (FastAPI)**: `CORSMiddleware` para permitir origem do frontend Next.js (`http://localhost:3000`).
-   **Segurança com SQLModel**:
    -   Modelos Seguros: `UserBase`, `UserCreate`, `UserRead` para controlar exposição de campos (e.g., `hashed_password` não em `UserRead`).
    -   Queries Seguras: Proteção SQL Injection, parametrização, validação de tipos.
-   **Logging e Monitorização**: Logs estruturados (FastAPI), eventos de sessão (NextAuth.js), auditoria BD (SQLModel events).
-   **Deployment e Produção**: Configuração Docker segura, separação de ambientes, gestão de secrets (Docker Secrets/variáveis de ambiente).
