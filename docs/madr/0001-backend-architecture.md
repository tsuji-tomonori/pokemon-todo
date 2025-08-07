# バックエンドアーキテクチャの実装方針

## ステータス

承認済み

## メタデータ

* 決定者: 開発チーム
* 日付: 2025-08-08

## コンテキスト

ポケモン風TODOアプリのバックエンドを実装するにあたり、以下の要件を満たす必要がある：
- RESTful APIの提供
- PostgreSQLによるデータ永続化
- LM Studio（AI）との連携
- 高速なレスポンス（3秒以内）
- Docker環境での動作
- 簡素で理解しやすい実装

## 決定事項

### 1. アーキテクチャパターン
**レイヤードアーキテクチャ**を採用する。

```
API Layer (FastAPI Routers)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (PostgreSQL)
```

### 2. 技術スタック

| カテゴリ | 技術選定 | 理由 |
|---------|---------|------|
| フレームワーク | FastAPI | 高速、型安全、自動ドキュメント生成 |
| ORM | SQLAlchemy 2.0+ | 成熟度、型ヒント対応、async対応 |
| バリデーション | Pydantic v2 | FastAPIとの統合、高速、型安全 |
| マイグレーション | Alembic | SQLAlchemyとの親和性 |
| HTTPクライアント | httpx | async対応、LM Studio連携用 |
| 非同期処理 | asyncio + uvicorn | 高パフォーマンス |

### 3. ディレクトリ構造

詳細なディレクトリ構造は`project_structure.md`を参照。バックエンドは以下の基本構造に従う：

```
backend/app/
├── api/v1/          # APIエンドポイント
├── core/            # 共通設定・接続
├── models/          # SQLAlchemyモデル
├── schemas/         # Pydanticスキーマ
├── services/        # ビジネスロジック
└── utils/           # ヘルパー関数
```

### 4. データモデル設計

#### 基本方針
- UUIDを主キーとして使用（分散環境対応）
- タイムスタンプは全モデルに付与
- ソフトデリート非採用（シンプルさ優先）

#### リレーション
```sql
Pokemon (1) ─── (*) Move
Pokemon (1) ─── (*) Battle
```

### 5. API設計

#### RESTful原則
- リソース指向URL
- 適切なHTTPメソッド使用
- ステートレス

#### エンドポイント構成（requirements.md準拠）
```
/api/v1/
├── pokemon/
│   ├── GET    /           # 一覧取得
│   ├── POST   /           # 作成
│   ├── GET    /{id}       # 詳細取得
│   ├── PUT    /{id}       # 更新
│   ├── DELETE /{id}       # 削除
│   ├── POST   /{id}/moves # わざ追加
│   └── GET    /{id}/current-battle # 現在のバトル状態
├── moves/
│   ├── GET    /{id}       # 詳細取得
│   ├── PUT    /{id}       # 更新
│   ├── DELETE /{id}       # 削除
│   └── POST   /{id}/execute # わざ実行（タスク完了＋バトル）
├── ai/
│   └── POST   /calculate-power # AI威力計算
└── battles/
    └── POST   /{id}/complete # バトル完了処理
```

### 6. サービス層設計

#### 責務分離（統一仕様準拠）
- **PokemonService**: ポケモン管理、レベル計算
- **MoveService**: わざ管理、実行処理
- **BattleService**: 一方向バトル処理、勝利処理
- **AIService**: LM Studio連携、威力推定
- **ExperienceService**: 経験値計算、進化判定

**バトル仕様**: シンプルな一方向型（敵は反撃しない、常に勝利）

#### トランザクション管理
- サービス層でトランザクション境界を管理
- Unit of Workパターンは不採用（複雑性回避）

### 7. AI連携設計

#### LM Studio接続
```python
class AIService:
    base_url = "http://host.docker.internal:1234"  # LM Studio標準ポート
    model = "microsoft/DialoGPT-medium"  # 実在するモデル
```

#### 威力計算プロンプト
```
タスク: {task_description}
このタスクの難易度を1-100で評価してください。
- 簡単なタスク: 1-30
- 通常のタスク: 31-70
- 難しいタスク: 71-100
```

### 8. エラーハンドリング

#### 例外階層
```python
AppException
├── NotFoundError (404)
├── ValidationError (400)
├── ConflictError (409)
└── ExternalServiceError (503)
```

#### グローバルエラーハンドラー
- 構造化エラーレスポンス
- ログ出力
- 適切なHTTPステータスコード

### 9. パフォーマンス最適化

#### データベース
- インデックス: pokemon_id, created_at
- N+1問題対策: eager loading
- コネクションプーリング

#### キャッシング
- 現段階では不採用（シンプルさ優先）
- 必要に応じて後から追加

#### 非同期処理
- DB操作: async SQLAlchemy
- AI連携: async httpx
- 並行処理: asyncio.gather()

### 10. セキュリティ

#### 基本対策
- CORS設定（フロントエンドのみ許可）
- SQLインジェクション対策（ORM使用）
- 入力検証（Pydantic）

#### 認証・認可
- 現段階では実装しない（要件による）
- 将来的にJWT認証を追加可能な設計

### 11. テスト戦略

#### テストレベル
- 単体テスト: services, utils
- 統合テスト: API endpoints
- E2Eテスト: 不採用（工数削減）

#### テスト環境
- pytest + pytest-asyncio
- テスト用PostgreSQL（Docker）
- モック: pytest-mock

### 12. 開発環境

#### ホットリロード
```dockerfile
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0"]
```

#### 環境変数
```env
DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/pokemon
LM_STUDIO_URL=http://host.docker.internal:1234
LM_STUDIO_MODEL=microsoft/DialoGPT-medium
ENVIRONMENT=development
```

## 実装優先順位

### Phase 1: 基盤（1-2日）
1. Docker環境構築
2. FastAPI基本設定
3. データベース接続
4. 基本的なエラーハンドリング

### Phase 2: CRUD実装（2-3日）
1. Pokemonモデル・API
2. Moveモデル・API
3. バリデーション実装

### Phase 3: ビジネスロジック（2-3日）
1. タスク完了処理
2. 経験値・レベル計算
3. バトルシステム

### Phase 4: AI連携（1-2日）
1. LM Studio接続
2. 威力自動計算API
3. エラーハンドリング

### Phase 5: 最適化（1-2日）
1. パフォーマンスチューニング
2. ログ整備
3. テスト実装

## 考慮事項

### メリット
- シンプルで理解しやすい構造
- FastAPIの恩恵（型安全、自動ドキュメント）
- 段階的な機能追加が容易
- Dockerによる環境統一

### デメリット
- 認証機能なし（セキュリティリスク）
- キャッシュなし（パフォーマンス制限）
- 同期的なAI処理（レスポンス遅延の可能性）

### 将来の拡張性
- マイクロサービス化への移行パス
- GraphQL導入の余地
- WebSocket（リアルタイムバトル）対応可能
- 認証機能の追加が容易

## 参考資料
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/)
- [Pydantic V2 Documentation](https://docs.pydantic.dev/)
- [Docker Compose Best Practices](https://docs.docker.com/compose/)
