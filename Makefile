.PHONY: help
help:
	@echo "Pokemon TODO App - Available commands:"
	@echo "  make setup       - Initial setup (install deps, build containers)"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs"
	@echo "  make migrate     - Run database migrations"
	@echo "  make clean       - Clean up containers and volumes"
	@echo "  make test        - Run tests"

.PHONY: setup
setup:
	@echo "Setting up Pokemon TODO App..."
	cp -n .env.example .env || true
	docker-compose build
	@echo "Setup complete! Run 'make up' to start the application"

.PHONY: up
up:
	docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

.PHONY: down
down:
	docker-compose down

.PHONY: restart
restart: down up

.PHONY: logs
logs:
	docker-compose logs -f

.PHONY: logs-backend
logs-backend:
	docker-compose logs -f backend

.PHONY: logs-frontend
logs-frontend:
	docker-compose logs -f frontend

.PHONY: logs-db
logs-db:
	docker-compose logs -f postgres

.PHONY: migrate
migrate:
	docker-compose exec backend alembic upgrade head

.PHONY: makemigrations
makemigrations:
	docker-compose exec backend alembic revision --autogenerate -m "$(message)"

.PHONY: shell-backend
shell-backend:
	docker-compose exec backend bash

.PHONY: shell-frontend
shell-frontend:
	docker-compose exec frontend sh

.PHONY: shell-db
shell-db:
	docker-compose exec postgres psql -U pokemon pokemon_todo

.PHONY: test
test:
	docker-compose exec backend pytest

.PHONY: clean
clean:
	docker-compose down -v
	docker system prune -f

.PHONY: rebuild
rebuild:
	docker-compose build --no-cache

.PHONY: install-frontend
install-frontend:
	cd frontend && npm install

.PHONY: install-backend
install-backend:
	cd backend && uv pip install -r requirements.txt