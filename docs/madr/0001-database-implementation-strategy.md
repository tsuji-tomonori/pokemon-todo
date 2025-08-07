# データベース実装戦略

- Status: accepted
- Date: 2025-01-07
- Deciders: Development Team

## Context and Problem Statement

ポケモン風TODOアプリケーションにおいて、タスク管理、ゲーミフィケーション要素、AI連携を効率的にサポートするデータベース設計と実装方針を決定する必要がある。

## Decision Drivers

- **パフォーマンス**: レスポンス時間3秒以内の要件
- **拡張性**: 将来的な機能追加への対応
- **開発効率**: ローカル開発環境での素早い開発サイクル
- **データ整合性**: ゲーム要素の状態管理の一貫性
- **シンプルさ**: 認証機能なしの簡素な実装

## Considered Options

1. **Option 1: PostgreSQL with SQLAlchemy ORM**
2. **Option 2: PostgreSQL with Raw SQL**
3. **Option 3: NoSQL (MongoDB)**

## Decision Outcome

**選択: Option 1 - PostgreSQL with SQLAlchemy ORM**

### 理由

- **型安全性**: SQLAlchemy + Pydanticによる強力な型チェック
- **マイグレーション**: Alembicによる堅牢なスキーマ管理
- **開発効率**: ORMによる高速な開発とメンテナンス性
- **リレーション管理**: ポケモン-わざ-バトルの複雑な関係を効率的に扱える

## Positive Consequences

- FastAPIとの優れた統合
- 自動的なスキーマ検証
- 開発者にとって直感的なPythonコード
- トランザクション管理の簡素化

## Negative Consequences

- ORMのオーバーヘッド（ただし、本アプリの規模では問題なし）
- 複雑なクエリの場合、Raw SQLより効率が落ちる可能性

## Implementation Details

### データベース構成

```
Database: pokemon_todo_db
Port: 5432
Container: postgres:15-alpine
```

### テーブル設計

#### 1. pokemonテーブル
```sql
CREATE TABLE pokemon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    evolution_stage INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. movesテーブル
```sql
CREATE TABLE moves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    power INTEGER CHECK (power >= 1 AND power <= 100),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. battlesテーブル
```sql
CREATE TABLE battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
    enemy_hp INTEGER NOT NULL,
    total_damage INTEGER DEFAULT 0,
    is_defeated BOOLEAN DEFAULT FALSE,
    experience_gained INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### インデックス戦略

```sql
-- 頻繁にアクセスされるカラムにインデックス
CREATE INDEX idx_pokemon_created_at ON pokemon(created_at DESC);
CREATE INDEX idx_moves_pokemon_id ON moves(pokemon_id);
CREATE INDEX idx_moves_is_completed ON moves(is_completed);
CREATE INDEX idx_battles_pokemon_id ON battles(pokemon_id);
CREATE INDEX idx_battles_created_at ON battles(created_at DESC);
```

### SQLAlchemy モデル定義

```python
# models/pokemon.py
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class Pokemon(Base):
    __tablename__ = "pokemon"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    evolution_stage = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # リレーション
    moves = relationship("Move", back_populates="pokemon", cascade="all, delete-orphan")
    battles = relationship("Battle", back_populates="pokemon", cascade="all, delete-orphan")
```

### コネクションプール設定

```python
# core/database.py
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgres:5432/pokemon_todo_db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=20,           # 接続プールサイズ
    max_overflow=40,        # 最大オーバーフロー
    pool_pre_ping=True,     # 接続の健全性チェック
    pool_recycle=3600,      # 1時間で接続リサイクル
    echo=False              # 本番環境ではFalse
)
```

### トランザクション管理

```python
# api/deps.py
from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# サービスレイヤーでのトランザクション例
async def complete_move_with_battle(move_id: UUID, db: Session):
    try:
        # トランザクション開始
        move = db.query(Move).filter(Move.id == move_id).first()
        move.is_completed = True
        move.completed_at = datetime.utcnow()

        # バトル処理
        battle = Battle(
            pokemon_id=move.pokemon_id,
            enemy_hp=100,
            total_damage=move.power
        )
        db.add(battle)

        # ポケモン経験値更新
        pokemon = db.query(Pokemon).filter(Pokemon.id == move.pokemon_id).first()
        pokemon.experience += battle.experience_gained

        db.commit()
        return {"success": True}
    except Exception as e:
        db.rollback()
        raise e
```

### マイグレーション戦略

```bash
# 初期マイグレーション作成
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head

# 変更時のマイグレーション
alembic revision --autogenerate -m "Add new column"
alembic upgrade head

# ロールバック
alembic downgrade -1
```

### バックアップ戦略

```yaml
# docker-compose.yml
postgres:
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./backups:/backups
  environment:
    POSTGRES_BACKUP_SCHEDULE: "0 2 * * *"  # 毎日2時
```

### パフォーマンス最適化

1. **クエリ最適化**
   - N+1問題回避: `joinedload()`使用
   - 必要なカラムのみ取得: `query(Pokemon.id, Pokemon.name)`
   - バルク操作: `bulk_insert_mappings()`

2. **キャッシュ戦略**
   - 頻繁にアクセスされるポケモンタイプ情報はアプリケーションレベルでキャッシュ
   - Redis導入検討（将来的な拡張）

3. **非同期処理**
   - FastAPIの非同期エンドポイント活用
   - 重い処理はバックグラウンドタスク化

### 監視とログ

```python
# ログ設定
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# スロークエリログ
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,  # 開発環境のみ
    echo_pool="debug"
)
```

## Links

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [FastAPI Database Guide](https://fastapi.tiangolo.com/tutorial/sql-databases/)
