.PHONY: install
install:
	uv pip install -r requirements.txt

.PHONY: install-dev
install-dev:
	uv pip install -r requirements.txt
	uv pip install -e ".[dev]"

.PHONY: run
run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: migrate
migrate:
	alembic upgrade head

.PHONY: makemigrations
makemigrations:
	alembic revision --autogenerate -m "$(message)"

.PHONY: test
test:
	pytest

.PHONY: format
format:
	black .
	ruff --fix .

.PHONY: lint
lint:
	black --check .
	ruff .
	mypy .