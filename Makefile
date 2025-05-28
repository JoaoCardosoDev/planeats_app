# Makefile for the project

# Variables
PYTHON = python3
PIP = pip3
DOCKER_COMPOSE = docker-compose

# Phony targets (targets that are not actual files)
.PHONY: all build up down logs ps lint test clean help init-alembic

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

# Testing (placeholder)
test:
@echo "Running tests (backend)..."
# Add backend test command here, e.g., $(DOCKER_COMPOSE) exec backend pytest
@echo "Running tests (frontend)..."
# Add frontend test command here, e.g., $(DOCKER_COMPOSE) exec frontend npm run test

# Clean (placeholder)
clean:
@echo "Cleaning up..."
# Add commands to remove build artifacts, pycache, etc.
find . -type f -name '*.py[co]' -delete
find . -type d -name '__pycache__' -delete
# Add command to remove frontend build artifacts if any, e.g., rm -rf frontend/.next frontend/node_modules

# Help target
help:
@echo "Available commands:"
@echo "  make build         - Build Docker images"
@echo "  make up            - Start services using docker-compose"
@echo "  make down          - Stop services using docker-compose"
@echo "  make logs          - View logs from services"
@echo "  make ps            - List running services"
@echo "  make lint          - Run linters"
@echo "  make test          - Run tests (placeholder)"
@echo "  make clean         - Clean up build artifacts (placeholder)"
@echo "  make init-alembic  - Initialize Alembic for the backend"
@echo "  make help          - Show this help message"
