# PlanEats 🍽️

A smart meal planning and recipe recommendation system that helps you make the most of your ingredients while discovering new recipes tailored to your preferences.

[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://typescriptlang.org)

## 📋 Overview

PlanEats is a comprehensive web application that combines intelligent pantry management with AI-powered recipe recommendations. Built as part of the **Projeto II - Programação Web 23-25** at **ETIC Algarve**, this application helps users reduce food waste, discover new recipes, and manage their dietary preferences efficiently.

### 🎯 Key Features

- **🏠 Smart Pantry Management**: Track your ingredients with expiration dates and quantities
- **🤖 AI-Powered Recipe Generation**: Get personalized recipes using Google's Gemini AI
- **📚 Recipe Discovery**: Browse and explore recipes from TheMealDB integration
- **🎯 Intelligent Recommendations**: Get recipe suggestions based on your available ingredients
- **👤 User Preferences**: Set dietary restrictions, cuisine preferences, and dislikes
- **🔐 Secure Authentication**: JWT-based authentication with Google OAuth integration
- **📱 Responsive Design**: Mobile-first design with modern UI components

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **NextAuth.js** for authentication
- **Zustand** for state management

**Backend:**
- **FastAPI** with Python 3.9+
- **SQLModel** with PostgreSQL
- **Alembic** for database migrations
- **JWT** authentication
- **Google Gemini AI** integration

**Infrastructure:**
- **Docker & Docker Compose** for containerization
- **PostgreSQL** database
- **Makefile** for development automation

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   External APIs │
                       │ • Gemini AI     │
                       │ • TheMealDB     │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose**
- **Git**
- **Make** (optional, for convenience commands)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JoaoCardosoDev/planeats_app.git
   cd planeats_app
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys and database credentials:
   ```env
   # Database
   POSTGRES_USER=planeats
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=planeats_db
   
   # Backend
   SECRET_KEY=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   
   # Frontend
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. **Start the application**
   ```bash
   # Using Make (recommended)
   make build && make up
   
   # Or using Docker Compose directly
   docker-compose up --build -d
   ```

4. **Access the application**
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📖 Usage Guide

### Getting Started

1. **Create an Account**: Register using email or sign in with Google
2. **Set Up Your Profile**: Configure dietary preferences and restrictions
3. **Add Pantry Items**: Input your ingredients with expiration dates
4. **Explore Recipes**: Browse our curated recipe collection
5. **Get AI Recommendations**: Generate personalized recipes based on your pantry
6. **Save Favorites**: Build your personal recipe collection

### Main Features

#### 🏠 Pantry Management (`/meu-frigorifico`)
- Add ingredients with quantities and expiration dates
- Track what's expiring soon
- Filter and search your pantry items
- Demo data available for testing

#### 🍳 Recipe Discovery (`/explorar`)
- Browse recipes from TheMealDB
- View detailed cooking instructions
- Save recipes to your collection
- Filter by cuisine, ingredients, and more

#### 🤖 AI Recipe Generation (`/receita-ia`)
- Generate custom recipes using your pantry items
- Specify dietary preferences and restrictions
- Get recipes in Portuguese with detailed instructions
- Save AI-generated recipes for later

#### 📊 Smart Recommendations (`/recomendacoes`)
- Get recipe suggestions based on your ingredients
- Prioritize recipes using expiring items
- Filter by cooking time, difficulty, and more

## 🛠️ Development

### Available Commands

```bash
# Docker operations
make build              # Build Docker images
make up                 # Start all services
make down               # Stop all services
make rebuild            # Rebuild and restart all services
make logs               # View all service logs

# Development
make frontend-logs      # View frontend logs
make backend-logs       # View backend logs
make frontend-shell     # Access frontend container shell
make backend-shell      # Access backend container shell

# Quality assurance
make lint               # Run code linters
make test               # Run test suites
make clean              # Clean build artifacts
```

### Project Structure

```
planeats_app/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and API clients
│   └── public/              # Static assets
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── crud/           # Database operations
│   ├── alembic/            # Database migrations
│   └── tests/              # Test suites
├── memory-bank/            # Project documentation
├── docker-compose.yml      # Container orchestration
├── Makefile               # Development commands
└── README.md              # This file
```

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh

#### Pantry Management
- `GET /api/v1/pantry/items` - List pantry items
- `POST /api/v1/pantry/items` - Add pantry item
- `PUT /api/v1/pantry/items/{id}` - Update pantry item
- `DELETE /api/v1/pantry/items/{id}` - Delete pantry item

#### Recipe Management
- `GET /api/v1/recipes/` - List recipes
- `POST /api/v1/recipes/` - Create custom recipe
- `GET /api/v1/recipes/{id}` - Get recipe details

#### AI Integration
- `POST /api/v1/gemini/generate-recipe` - Generate AI recipe
- `GET /api/v1/mealdb/random` - Get random recipe from TheMealDB

### Testing

```bash
# Run all tests
make test

# Run backend tests only
docker-compose exec backend pytest

# Run tests with coverage
docker-compose exec backend pytest --cov
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_USER` | Database username | ✅ |
| `POSTGRES_PASSWORD` | Database password | ✅ |
| `POSTGRES_DB` | Database name | ✅ |
| `SECRET_KEY` | JWT secret key | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ⚠️ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ⚠️ |

### Database Migrations

```bash
# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "Description"

# Apply migrations
docker-compose exec backend alembic upgrade head

# View migration history
docker-compose exec backend alembic history
```

## 📊 Features Status

| Feature | Status | Description |
|---------|--------|-------------|
| ✅ User Authentication | Complete | JWT + Google OAuth |
| ✅ Pantry Management | Complete | CRUD operations with filters |
| ✅ Recipe Discovery | Complete | TheMealDB integration |
| ✅ AI Recipe Generation | Complete | Gemini AI integration |
| ✅ User Preferences | Complete | Dietary restrictions & cuisines |
| ✅ Recipe Recommendations | Complete | Intelligent suggestions |
| ✅ Responsive UI | Complete | Mobile-first design |
| ✅ Docker Setup | Complete | Full containerization |

## 🤝 Contributing

This project follows academic guidelines for **ETIC Algarve - Projeto II**. 

### Team Roles
- **João Cardoso** - Data & Infrastructure (Owner)
- **Santiago** - Backend & Business Logic
- **Jessiellen** - Frontend & User Experience

### Development Guidelines

1. Follow the established coding standards
2. Use feature branches for new development
3. Write tests for new functionality
4. Update documentation as needed
5. Use conventional commit messages

## 📄 License

This project is developed for academic purposes at ETIC Algarve. All rights reserved to the development team.

## 🆘 Support

For development issues or questions:

1. Check the [API Documentation](http://localhost:8000/docs) when running locally
2. Review the project documentation in the `memory-bank/` directory
3. Check container logs: `make logs`
4. Verify environment setup: ensure all required variables are set in `.env`

---

**Built with ❤️ by the PlanEats Team at ETIC Algarve**
