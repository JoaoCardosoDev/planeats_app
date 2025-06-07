# Makefile for the project

# Variables
PYTHON = python3
PIP = pip3
DOCKER_COMPOSE = docker-compose

# Phony targets (targets that are not actual files)
.PHONY: all build up down logs ps lint test clean help init-alembic frontend-restart frontend-logs backend-restart backend-logs restart-all frontend-shell backend-shell rebuild

# Default target
all: help

# Alembic initialization
init-alembic:
	$(DOCKER_COMPOSE) exec backend alembic init alembic

# Docker-compose targets
build:
	@echo "Building Docker images..."
	$(DOCKER_COMPOSE) build

up:
	@echo "Starting services in detached mode..."
	$(DOCKER_COMPOSE) up -d

down:
	@echo "Stopping services..."
	$(DOCKER_COMPOSE) down

logs:
	@echo "Showing logs for services..."
	$(DOCKER_COMPOSE) logs -f

ps:
	@echo "Listing running services..."
	$(DOCKER_COMPOSE) ps

# Linting
lint:
	@echo "Running linters via pre-commit..."
	pre-commit run --all-files

# Testing
test:
	@echo "Running tests (backend)..."
	$(DOCKER_COMPOSE) exec backend pytest
	@echo "Running tests (frontend)..."
	$(DOCKER_COMPOSE) exec frontend npm run test

# Development servers (Docker-based)
frontend-restart:
	@echo "Restarting frontend container..."
	$(DOCKER_COMPOSE) restart frontend

frontend-logs:
	@echo "Showing frontend logs..."
	$(DOCKER_COMPOSE) logs -f frontend

backend-restart:
	@echo "Restarting backend container..."
	$(DOCKER_COMPOSE) restart backend

backend-logs:
	@echo "Showing backend logs..."
	$(DOCKER_COMPOSE) logs -f backend

# Service management
restart-all:
	@echo "Restarting all services..."
	$(DOCKER_COMPOSE) restart

rebuild:
	@echo "Rebuilding containers (down -> build -> up)..."
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) build
	$(DOCKER_COMPOSE) up -d
	@echo "All containers rebuilt and started!"

frontend-shell:
	@echo "Opening shell in frontend container..."
	$(DOCKER_COMPOSE) exec frontend sh

backend-shell:
	@echo "Opening shell in backend container..."
	$(DOCKER_COMPOSE) exec backend sh

# Clean
clean:
	@echo "Cleaning up..."
	# Add commands to remove build artifacts, pycache, etc.
	find . -type f -name '*.py[co]' -delete
	find . -type d -name '__pycache__' -delete
	# Add command to remove frontend build artifacts if any, e.g., rm -rf frontend/.next frontend/node_modules

# Help target
help:
	@echo "Available commands:"
	@echo "  make build             - Build Docker images"
	@echo "  make up                - Start services using docker-compose"
	@echo "  make down              - Stop services using docker-compose"
	@echo "  make rebuild           - Down, rebuild, and start all containers"
	@echo "  make logs              - View logs from all services"
	@echo "  make ps                - List running services"
	@echo "  make lint              - Run linters"
	@echo "  make test              - Run tests"
	@echo "  make clean             - Clean up build artifacts"
	@echo "  make init-alembic      - Initialize Alembic for the backend"
	@echo ""
	@echo "Development commands (Docker):"
	@echo "  make frontend-restart  - Restart frontend container"
	@echo "  make frontend-logs     - Show frontend container logs"
	@echo "  make backend-restart   - Restart backend container"
	@echo "  make backend-logs      - Show backend container logs"
	@echo "  make restart-all       - Restart all containers"
	@echo "  make rebuild           - Down, rebuild, and start all containers"
	@echo "  make frontend-shell    - Open shell in frontend container"
	@echo "  make backend-shell     - Open shell in backend container"
	@echo ""
	@echo "  make help              - Show this help message"
