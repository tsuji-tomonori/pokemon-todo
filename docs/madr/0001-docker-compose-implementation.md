# Docker Compose実装方針

## ステータス

承認済み

## メタデータ

* 決定者: 開発チーム
* 日付: 2025-08-08
* タグ: docker, infrastructure, development-environment

## コンテキストと問題提起

ポケモン風TODOアプリの開発環境を構築するにあたり、複数のサービス（フロントエンド、バックエンド、データベース、AI）を効率的に管理・運用する必要がある。開発者が簡単に環境を立ち上げられ、本番環境に近い状態で開発を進められる環境構成が求められている。

## 決定要因

* **開発効率**: ワンコマンドでの環境構築と起動
* **再現性**: どの開発者でも同じ環境を構築できる
* **独立性**: 各サービスが独立して開発・テスト可能
* **スケーラビリティ**: 将来的な本番環境への移行を考慮
* **開発体験**: ホットリロード、自動再起動などの開発支援機能
* **デバッグ容易性**: ログ管理とサービス間通信の可視化

## 検討した選択肢

### オプション1: Docker Compose単体構成
すべてのサービスをDocker Composeで管理

**メリット:**
- シンプルな構成管理
- 統一されたネットワーク管理
- 一元的なログ管理

**デメリット:**
- LM Studioのコンテナ化が困難
- GPUアクセスの複雑性

### オプション2: Docker Compose + ネイティブLM Studio
Docker ComposeでWebアプリケーションを管理し、LM Studioはホストで実行

**メリット:**
- LM StudioのGPU利用が簡単
- 既存のLM Studio設定を活用可能
- 開発環境の柔軟性

**デメリット:**
- 完全なコンテナ化ではない
- 環境設定の一部が手動

### オプション3: Kubernetes (Minikube/Kind)
ローカルKubernetes環境での運用

**メリット:**
- 本番環境との高い互換性
- 高度なオーケストレーション

**デメリット:**
- 学習コストが高い
- リソース消費が大きい
- 開発環境として過剰

## 決定

**オプション2: Docker Compose + ネイティブLM Studio** を採用する。

## 実装詳細

### 1. サービス構成

```yaml
version: '3.8'

services:
  # PostgreSQLデータベース
  postgres:
    image: postgres:15-alpine
    container_name: pokemon-todo-db
    environment:
      POSTGRES_DB: pokemon_todo
      POSTGRES_USER: pokemon_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pokemon_user -d pokemon_todo"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - pokemon-network
    restart: unless-stopped

  # FastAPIバックエンド
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        - PYTHON_VERSION=3.11
    container_name: pokemon-todo-backend
    environment:
      DATABASE_URL: postgresql://pokemon_user:${DB_PASSWORD}@postgres:5432/pokemon_todo
      LM_STUDIO_URL: ${LM_STUDIO_URL:-http://host.docker.internal:1234}
      LM_STUDIO_MODEL: microsoft/DialoGPT-medium
      ENVIRONMENT: development
      LOG_LEVEL: debug
    volumes:
      - ./backend:/app
      - backend_cache:/root/.cache
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    networks:
      - pokemon-network
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped

  # Reactフロントエンド
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: pokemon-todo-frontend
    environment:
      VITE_API_URL: http://localhost:8000
      VITE_ENVIRONMENT: development
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - frontend_cache:/root/.npm
    ports:
      - "5173:5173"
    depends_on:
      - backend
    command: ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
    networks:
      - pokemon-network
    restart: unless-stopped

volumes:
  postgres_data:
    name: pokemon-todo-postgres-data
  backend_cache:
    name: pokemon-todo-backend-cache
  frontend_cache:
    name: pokemon-todo-frontend-cache

networks:
  pokemon-network:
    name: pokemon-todo-network
    driver: bridge
```

### 2. Dockerfileの構成

#### Backend Dockerfile
```dockerfile
# マルチステージビルド
FROM python:3.11-slim as base

WORKDIR /app

# 依存関係のインストール
FROM base as dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 開発環境
FROM dependencies as development
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
ENV PYTHONPATH=/app
EXPOSE 8000

# 本番環境（将来的な拡張用）
FROM dependencies as production
COPY . .
ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile
```dockerfile
# マルチステージビルド
FROM node:20-alpine as base

WORKDIR /app

# 依存関係のインストール
FROM base as dependencies
COPY package*.json ./
RUN npm ci --cache /tmp/npm-cache

# 開発環境
FROM dependencies as development
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ビルドステージ
FROM dependencies as build
COPY . .
RUN npm run build

# 本番環境（将来的な拡張用）
FROM nginx:alpine as production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 3. 環境変数管理

`.env.example`:
```env
# Database
DB_PASSWORD=pokemon_secure_password_2024

# LM Studio
LM_STUDIO_URL=http://host.docker.internal:1234
LM_STUDIO_MODEL=microsoft/DialoGPT-medium

# Application
NODE_ENV=development
ENVIRONMENT=development

# Ports (オプション)
FRONTEND_PORT=5173
BACKEND_PORT=8000
DB_PORT=5432
```

### 4. 開発支援スクリプト

`Makefile`:
```makefile
.PHONY: help up down restart logs clean setup

help:
	@echo "使用可能なコマンド:"
	@echo "  make setup   - 初期セットアップ"
	@echo "  make up      - サービス起動"
	@echo "  make down    - サービス停止"
	@echo "  make restart - サービス再起動"
	@echo "  make logs    - ログ表示"
	@echo "  make clean   - ボリューム削除"
	@echo "  make db-migrate - DBマイグレーション実行"
	@echo "  make test    - テスト実行"

setup:
	@cp .env.example .env
	@echo "LM Studioを起動してください (ポート: 1234、microsoft/DialoGPT-mediumモデル)"
	@docker-compose build
	@docker-compose up -d postgres
	@sleep 5
	@docker-compose up -d

up:
	@docker-compose up -d

down:
	@docker-compose down

restart:
	@docker-compose restart

logs:
	@docker-compose logs -f

clean:
	@docker-compose down -v
	@docker volume prune -f

db-migrate:
	@docker-compose exec backend alembic upgrade head

test:
	@docker-compose exec backend pytest
	@docker-compose exec frontend npm test
```

### 5. ネットワーク設計

```
┌─────────────────┐
│   ホストマシン    │
│                 │
│  LM Studio      │
│  (port:1234)    │
└────────┬────────┘
         │
    host.docker.internal
         │
┌────────┴────────────────────────────┐
│     Docker Network: pokemon-network  │
│                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  │Frontend  │  │Backend   │  │PostgreSQL│
│  │:5173     ├──┤:8000     ├──┤:5432     │
│  └──────────┘  └──────────┘  └──────────┘
└──────────────────────────────────────┘
```

### 6. ボリュームマウント戦略

- **postgres_data**: データベースの永続化
- **backend_cache**: Pythonパッケージキャッシュ
- **frontend_cache**: npmパッケージキャッシュ
- **ソースコード**: ホットリロード用にバインドマウント

### 7. ヘルスチェック設定

各サービスにヘルスチェックを実装:
- PostgreSQL: pg_isreadyコマンド
- Backend: /health エンドポイント
- Frontend: HTTPステータスチェック

## 結果

この決定により以下が実現される:

### 良い結果
- 開発環境の立ち上げが`docker-compose up`一つで完了
- ホットリロードによる快適な開発体験
- サービス間の依存関係が明確
- ログの一元管理
- 環境の再現性確保

### 悪い結果
- LM Studioの手動起動が必要
- Dockerの学習が必要
- 初回ビルドに時間がかかる

## 今後の検討事項

1. **CI/CD統合**: GitHub ActionsでのDocker Compose利用
2. **本番環境移行**: Docker SwarmまたはKubernetesへの移行パス
3. **監視ツール**: PrometheusやGrafanaの追加
4. **バックアップ戦略**: データベースの自動バックアップ
5. **セキュリティ強化**: シークレット管理の改善

## 参考資料

- [Docker Compose ドキュメント](https://docs.docker.com/compose/)
- [FastAPI Docker デプロイメント](https://fastapi.tiangolo.com/deployment/docker/)
- [Vite Docker 設定](https://vitejs.dev/guide/static-deploy.html)
- [PostgreSQL Docker 公式イメージ](https://hub.docker.com/_/postgres)
