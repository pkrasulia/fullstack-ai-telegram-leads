# ===========================================
# FULLSTACK AI TELEGRAM LEADS - MAKEFILE
# ===========================================

# Environment files
ENV_SHARED := .env.shared
ENV_BACKEND := .env.backend
ENV_FRONTEND := .env.frontend
ENV_AGENT := .env.agent
ENV_TELEGRAM := .env.telegram
ENV_MONITORING := .env.monitoring

# Docker compose commands
COMPOSE_DEV := docker-compose.dev.yml
COMPOSE_INFRA := docker-compose.infrastructure.yml
COMPOSE_PROD := docker-compose.prod.yml
COMPOSE_MONITORING := docker-compose.monitoring.yml

DC_INFRA := docker compose -f $(COMPOSE_INFRA) --env-file $(ENV_SHARED)
DC_DEV := docker compose -f $(COMPOSE_DEV) --env-file $(ENV_SHARED) --env-file $(ENV_BACKEND) --env-file $(ENV_FRONTEND) --env-file $(ENV_AGENT) --env-file $(ENV_TELEGRAM)
DC_PROD := docker compose -f $(COMPOSE_PROD) --env-file $(ENV_SHARED) --env-file $(ENV_BACKEND) --env-file $(ENV_FRONTEND) --env-file $(ENV_AGENT) --env-file $(ENV_TELEGRAM)
DC_MONITORING := docker compose -f $(COMPOSE_MONITORING) --env-file $(ENV_MONITORING)

# Individual services
DC_BACKEND := docker compose -f $(COMPOSE_DEV) --env-file $(ENV_SHARED) --env-file $(ENV_BACKEND)
DC_FRONTEND := docker compose -f $(COMPOSE_DEV) --env-file $(ENV_SHARED) --env-file $(ENV_FRONTEND)
DC_TELEGRAM := docker compose -f $(COMPOSE_DEV) --env-file $(ENV_SHARED) --env-file $(ENV_TELEGRAM)
DC_AGENT := docker compose -f $(COMPOSE_DEV) --env-file $(ENV_SHARED) --env-file $(ENV_AGENT)

.PHONY: help setup dev stop logs clean
.PHONY: backend frontend telegram agent
.PHONY: prod prod-stop
.PHONY: mg mg-stop

# ===========================================
# MAIN COMMANDS
# ===========================================

## Show help
help:
	@echo "🚀 FULLSTACK AI TELEGRAM LEADS"
	@echo ""
	@echo "📦 SETUP & DEVELOPMENT:"
	@echo "  make setup     - Setup infrastructure (DB, Redis, Mail)"
	@echo "  make dev       - Start all services"
	@echo "  make stop      - Stop all services"
	@echo "  make logs      - Show logs"
	@echo ""
	@echo "🔧 INDIVIDUAL SERVICES:"
	@echo "  make backend   - Start only backend"
	@echo "  make frontend  - Start only frontend"
	@echo "  make telegram  - Start only telegram bot"
	@echo "  make agent     - Start only AI agent"
	@echo ""
	@echo "🏭 PRODUCTION:"
	@echo "  make prod      - Start production"
	@echo "  make prod-stop - Stop production"
	@echo ""
	@echo "📊 MONITORING:"
	@echo "  make mg        - Start monitoring stack"
	@echo "  make mg-stop   - Stop monitoring stack"
	@echo ""
	@echo "🧹 CLEANUP:"
	@echo "  make clean     - Clean containers & images"

## Setup infrastructure (Database, Redis, Mail)
setup:
	@echo "🔧 Starting infrastructure..."
	$(DC_INFRA) up -d

## Start all development services
dev:
	@echo "🚀 Starting all services..."
	$(DC_DEV) up -d

## Stop all services
stop:
	@echo "⏹️  Stopping services..."
	$(DC_DEV) down

## Show logs (use: make logs s=backend for specific service)
logs:
	$(DC_DEV) logs -f $(s)

# ===========================================
# INDIVIDUAL SERVICES
# ===========================================

## Start backend only
backend:
	@echo "🔧 Starting backend..."
	$(DC_BACKEND) up backend -d

## Start frontend only
frontend:
	@echo "🎨 Starting frontend..."
	$(DC_FRONTEND) up frontend -d

## Start telegram bot only
telegram:
	@echo "📱 Starting telegram bot..."
	$(DC_TELEGRAM) up telegram-client -d

## Start AI agent only
agent:
	@echo "🤖 Starting AI agent..."
	$(DC_AGENT) up agent -d

# ===========================================
# PRODUCTION
# ===========================================

## Start production
prod:
	@echo "🏭 Starting production..."
	$(DC_PROD) up -d

## Stop production
prod-stop:
	@echo "⏹️  Stopping production..."
	$(DC_PROD) down

# ===========================================
# MONITORING
# ===========================================

## Start monitoring stack
mg:
	@echo "📊 Starting monitoring stack..."
	$(DC_MONITORING) up -d

## Stop monitoring stack
mg-stop:
	@echo "⏹️  Stopping monitoring stack..."
	$(DC_MONITORING) down

# ===========================================
# CLEANUP
# ===========================================

## Clean containers and images
clean:
	@echo "🧹 Cleaning up..."
	$(DC_DEV) down
	docker system prune -f
