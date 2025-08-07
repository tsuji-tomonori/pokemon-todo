# Phase 1: 基盤構築

**期間**: 3-4日
**目標**: 開発環境の構築と基本的なCRUD API・UI実装

## 概要

プロジェクトの土台となる開発環境とデータベース、基本的なCRUD機能を実装します。この段階では、シンプルで動作する基本機能の実現を最優先とします。

## Day 1: 環境構築とプロジェクト初期化

### Backend基盤 (4-5時間)

#### Docker環境構築
- [ ] `docker-compose.yml` 作成（[Docker構成MADR](../madr/0001-docker-compose-implementation.md)参照）
- [ ] PostgreSQL コンテナ設定
- [ ] FastAPI コンテナ設定
- [ ] 環境変数設定（`.env`）

#### FastAPI基本設定
- [ ] プロジェクト構造作成（[project_structure.md](../../project_structure.md)参照）
- [ ] `app/main.py` - FastAPIアプリケーション初期化
- [ ] `app/config.py` - 設定管理
- [ ] `app/core/database.py` - データベース接続
- [ ] 基本的なCORS設定

#### データベース初期化
- [ ] SQLAlchemyモデル作成
  - `Pokemon` モデル
  - `Move` モデル
  - `Battle` モデル
- [ ] Alembicマイグレーション設定
- [ ] 初期マイグレーション実行

**成果物**: 動作するBackend開発環境

### Frontend基盤 (3-4時間)

#### React/Vite環境構築
- [ ] Viteプロジェクト作成
- [ ] TypeScript設定
- [ ] 必要な依存関係インストール
  - React Router
  - Zustand
  - Axios
  - Tailwind CSS
  - Framer Motion

#### 基本構造作成
- [ ] ディレクトリ構造設定（[project_structure.md](../../project_structure.md)参照）
- [ ] `src/App.tsx` - ルートコンポーネント
- [ ] `src/api/client.ts` - APIクライアント設定
- [ ] 基本的なルーティング設定

**成果物**: 動作するFrontend開発環境

### 動作確認
- [ ] Docker Compose起動確認
- [ ] データベース接続確認
- [ ] Frontend/Backend通信確認
- [ ] 基本的なHello Worldページ

## Day 2: Pokemon CRUD実装

### Backend API実装 (5-6時間)

#### Pokemonモデル完成
- [ ] `models/pokemon.py` - SQLAlchemyモデル定義
- [ ] `schemas/pokemon.py` - Pydanticスキーマ
- [ ] 必要なバリデーション実装

#### Pokemon API エンドポイント
- [ ] `api/v1/pokemon.py`実装
  - `POST /api/v1/pokemon` - ポケモン作成
  - `GET /api/v1/pokemon` - 一覧取得
  - `GET /api/v1/pokemon/{id}` - 詳細取得
  - `PUT /api/v1/pokemon/{id}` - 更新
  - `DELETE /api/v1/pokemon/{id}` - 削除

#### サービス層実装
- [ ] `services/pokemon_service.py` - ビジネスロジック
- [ ] 基本的なエラーハンドリング
- [ ] バリデーション処理

**成果物**: Pokemon CRUD API

### Frontend実装 (4-5時間)

#### 型定義とAPI層
- [ ] `types/pokemon.ts` - Pokemon型定義
- [ ] `api/pokemon.ts` - Pokemon API呼び出し
- [ ] `stores/pokemonStore.ts` - Zustand状態管理

#### 基本コンポーネント
- [ ] `components/common/Button.tsx` - 基本ボタン
- [ ] `components/common/Card.tsx` - 基本カード
- [ ] `components/pokemon/PokemonCard.tsx` - ポケモンカード
- [ ] `components/pokemon/PokemonList.tsx` - ポケモン一覧

#### ページ実装
- [ ] `pages/HomePage.tsx` - ホーム画面
- [ ] 基本的なスタイリング適用

**成果物**: Pokemon一覧・表示機能

### テストとバグ修正
- [ ] API動作テスト
- [ ] CRUD操作テスト
- [ ] エラーケース確認

## Day 3: Move CRUD実装

### Backend実装 (5-6時間)

#### Moveモデル実装
- [ ] `models/move.py` - Move SQLAlchemyモデル
- [ ] `schemas/move.py` - Move Pydanticスキーマ
- [ ] Pokemon-Move リレーション設定

#### Move API エンドポイント
- [ ] `api/v1/moves.py`実装
  - `POST /api/v1/pokemon/{pokemon_id}/moves` - わざ追加
  - `GET /api/v1/pokemon/{pokemon_id}/moves` - わざ一覧
  - `PUT /api/v1/moves/{id}` - わざ更新
  - `DELETE /api/v1/moves/{id}` - わざ削除

#### サービス層
- [ ] `services/move_service.py` - Move操作ロジック
- [ ] Pokemon-Move関連操作
- [ ] データ整合性チェック

**成果物**: Move CRUD API

### Frontend実装 (4-5時間)

#### Move関連実装
- [ ] `types/move.ts` - Move型定義
- [ ] `api/moves.ts` - Move API呼び出し
- [ ] PokeomStoreにMove操作追加

#### Moveコンポーネント
- [ ] `components/moves/MoveCard.tsx` - わざカード
- [ ] `components/moves/MoveList.tsx` - わざ一覧
- [ ] `components/moves/MoveForm.tsx` - わざ追加フォーム

#### ページ更新
- [ ] Pokemon詳細ページ追加
- [ ] Move管理機能統合

**成果物**: Move CRUD機能

## Day 4: 統合とUI改善

### API統合テスト (2-3時間)
- [ ] Pokemon-Move連携テスト
- [ ] データ整合性確認
- [ ] エラーハンドリング改善

### UI改善 (4-5時間)

#### スタイリング実装
- [ ] Tailwind CSS設定完成（[スタイリングMADR](../madr/0005-styling-system.md)参照）
- [ ] 基本的なネオモーフィズムスタイル適用
- [ ] タイプ別カラー実装

#### UX改善
- [ ] ローディング状態表示
- [ ] エラーメッセージ表示
- [ ] 成功通知実装
- [ ] 基本的なバリデーション

#### レスポンシブ対応
- [ ] モバイル表示確認
- [ ] タブレット表示確認
- [ ] 基本的な画面サイズ対応

**成果物**: 使いやすいCRUD界面

### ドキュメント更新 (1時間)
- [ ] API仕様更新
- [ ] README更新
- [ ] 設定手順文書化

## 完了基準

### 機能要件
- [ ] ポケモンの作成・読取・更新・削除が正常動作
- [ ] わざの作成・読取・更新・削除が正常動作
- [ ] ポケモンとわざの関連付けが正常動作
- [ ] レスポンシブデザインが基本的に動作

### 技術要件
- [ ] Docker環境で全サービスが起動
- [ ] データベースマイグレーションが動作
- [ ] Frontend/Backend間でAPI通信が正常
- [ ] 基本的なエラーハンドリングが実装済み

### 品質要件
- [ ] コード整理とリファクタリング完了
- [ ]基本的なバリデーションが実装済み
- [ ] エラーメッセージが適切に表示
- [ ] 主要な操作にローディング状態表示

## 技術的詳細

### 使用技術スタック
- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Zustand, Tailwind CSS
- **Infrastructure**: Docker, Docker Compose

### ディレクトリ構造
詳細は[project_structure.md](../../project_structure.md)を参照

### 設定ファイル
- `.env`: 環境変数
- `docker-compose.yml`: Docker構成
- `alembic.ini`: マイグレーション設定
- `tailwind.config.js`: スタイル設定

## トラブルシューティング

### よくある問題
1. **Docker起動失敗**: ポート競合確認
2. **データベース接続エラー**: 環境変数確認
3. **CORS エラー**: FastAPI CORS設定確認
4. **型エラー**: TypeScript設定確認

### デバッグ方法
- `docker-compose logs -f`: コンテナログ確認
- `make logs`: 統合ログ確認
- ブラウザ開発者ツール: Frontend エラー確認

## 次のステップ

Phase1完了後は[Phase2: コア機能](./phase2-core-features.md)に進みます。

---

**参照ドキュメント**:
- [要件定義書](../../requirements.md)
- [プロジェクト構成](../../project_structure.md)
- [バックエンドアーキテクチャMADR](../madr/0001-backend-architecture.md)
- [フロントエンドアーキテクチャMADR](../madr/0001-frontend-architecture.md)
