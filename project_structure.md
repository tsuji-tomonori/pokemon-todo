# ポケモン風TODOアプリ プロジェクト構成

## 1. プロジェクト全体構成

### 技術スタック
- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: FastAPI + Python 3.11+
- **データベース**: PostgreSQL 15+
- **AI**: LM Studio (google/gemma-3n-e4b)
- **コンテナ**: Docker Compose
- **スタイリング**: Tailwind CSS + Framer Motion
- **状態管理**: Zustand
- **HTTPクライアント**: Axios
- **アイコン**: Phosphor Icons

## 2. ディレクトリ構成

```
pokemon-todo/
├── docker-compose.yml          # Docker Compose設定
├── .env.example               # 環境変数テンプレート
├── .gitignore                 # Git除外設定
├── README.md                  # プロジェクト説明
├── requirements.md            # 要件定義書
├── project_structure.md       # このファイル
│
├── frontend/                  # フロントエンドアプリケーション
│   ├── Dockerfile            # Frontendコンテナ設定
│   ├── package.json          # Node.js依存関係
│   ├── package-lock.json
│   ├── tsconfig.json         # TypeScript設定
│   ├── vite.config.ts        # Vite設定
│   ├── tailwind.config.js    # Tailwind CSS設定
│   ├── postcss.config.js     # PostCSS設定
│   ├── .eslintrc.json        # ESLint設定
│   ├── .prettierrc           # Prettier設定
│   │
│   ├── public/               # 静的ファイル
│   │   ├── favicon.ico
│   │   └── sprites/          # ポケモンスプライト画像
│   │       ├── pokemon/      # ポケモン画像
│   │       └── types/        # タイプアイコン
│   │
│   └── src/                  # ソースコード
│       ├── main.tsx          # エントリーポイント
│       ├── App.tsx           # ルートコンポーネント
│       ├── index.css         # グローバルスタイル
│       ├── vite-env.d.ts     # Vite型定義
│       │
│       ├── types/            # TypeScript型定義
│       │   ├── pokemon.ts    # ポケモン関連の型
│       │   ├── move.ts       # わざ関連の型
│       │   ├── battle.ts     # バトル関連の型
│       │   └── api.ts        # API関連の型
│       │
│       ├── api/              # API通信層
│       │   ├── client.ts     # APIクライアント設定
│       │   ├── pokemon.ts    # ポケモンAPI
│       │   ├── moves.ts      # わざAPI
│       │   ├── battle.ts     # バトルAPI
│       │   └── ai.ts         # AI連携API
│       │
│       ├── stores/           # 状態管理（Zustand）
│       │   ├── pokemonStore.ts   # ポケモン状態
│       │   ├── battleStore.ts    # バトル状態
│       │   ├── uiStore.ts        # UI状態
│       │   └── themeStore.ts     # テーマ状態
│       │
│       ├── components/       # Reactコンポーネント
│       │   ├── common/       # 共通コンポーネント
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Toast.tsx
│       │   │   ├── LoadingSpinner.tsx
│       │   │   ├── ProgressBar.tsx
│       │   │   └── TypeBadge.tsx
│       │   │
│       │   ├── layout/       # レイアウトコンポーネント
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── Layout.tsx
│       │   │
│       │   ├── pokemon/      # ポケモン関連コンポーネント
│       │   │   ├── PokemonCard.tsx
│       │   │   ├── PokemonList.tsx
│       │   │   ├── PokemonDetail.tsx
│       │   │   ├── PokemonForm.tsx
│       │   │   ├── LevelIndicator.tsx
│       │   │   └── ExperienceBar.tsx
│       │   │
│       │   ├── moves/        # わざ関連コンポーネント
│       │   │   ├── MoveCard.tsx
│       │   │   ├── MoveList.tsx
│       │   │   ├── MoveForm.tsx
│       │   │   ├── PowerGauge.tsx
│       │   │   └── MoveCompleteButton.tsx
│       │   │
│       │   └── battle/       # バトル関連コンポーネント
│       │       ├── BattleScreen.tsx
│       │       ├── BattleAnimation.tsx
│       │       ├── DamageDisplay.tsx
│       │       ├── HPBar.tsx
│       │       ├── MoveSelector.tsx
│       │       └── VictoryModal.tsx
│       │
│       ├── pages/            # ページコンポーネント
│       │   ├── HomePage.tsx
│       │   ├── PokemonDetailPage.tsx
│       │   ├── BattlePage.tsx
│       │   └── NotFoundPage.tsx
│       │
│       ├── hooks/            # カスタムフック
│       │   ├── usePokemon.ts
│       │   ├── useMoves.ts
│       │   ├── useBattle.ts
│       │   ├── useAnimation.ts
│       │   └── useTheme.ts
│       │
│       ├── utils/            # ユーティリティ関数
│       │   ├── constants.ts  # 定数定義
│       │   ├── helpers.ts    # ヘルパー関数
│       │   ├── validators.ts # バリデーション
│       │   ├── formatters.ts # フォーマッター
│       │   └── animations.ts # アニメーション定義
│       │
│       └── styles/           # スタイル関連
│           ├── themes.ts     # テーマ定義
│           ├── colors.ts     # カラーパレット
│           └── animations.css # CSSアニメーション
│
├── backend/                   # バックエンドアプリケーション
│   ├── Dockerfile            # Backendコンテナ設定
│   ├── requirements.txt      # Python依存関係
│   ├── requirements-dev.txt  # 開発用依存関係
│   ├── pyproject.toml        # Pythonプロジェクト設定
│   ├── .env                  # 環境変数（.gitignore対象）
│   ├── alembic.ini           # データベースマイグレーション設定
│   │
│   ├── app/                  # アプリケーションコード
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPIエントリーポイント
│   │   ├── config.py         # 設定管理
│   │   │
│   │   ├── api/              # APIエンドポイント
│   │   │   ├── __init__.py
│   │   │   ├── deps.py       # 依存性注入
│   │   │   └── v1/           # APIバージョン1
│   │   │       ├── __init__.py
│   │   │       ├── router.py # ルーター集約
│   │   │       ├── pokemon.py    # ポケモンエンドポイント
│   │   │       ├── moves.py      # わざエンドポイント
│   │   │       ├── battle.py     # バトルエンドポイント
│   │   │       └── ai.py         # AI連携エンドポイント
│   │   │
│   │   ├── core/             # コア機能
│   │   │   ├── __init__.py
│   │   │   ├── database.py   # データベース接続
│   │   │   ├── security.py   # セキュリティ設定
│   │   │   └── exceptions.py # カスタム例外
│   │   │
│   │   ├── models/           # SQLAlchemyモデル
│   │   │   ├── __init__.py
│   │   │   ├── pokemon.py    # Pokemonモデル
│   │   │   ├── move.py       # Moveモデル
│   │   │   └── battle.py     # Battleモデル
│   │   │
│   │   ├── schemas/          # Pydanticスキーマ
│   │   │   ├── __init__.py
│   │   │   ├── pokemon.py    # Pokemonスキーマ
│   │   │   ├── move.py       # Moveスキーマ
│   │   │   ├── battle.py     # Battleスキーマ
│   │   │   └── ai.py         # AIスキーマ
│   │   │
│   │   ├── services/         # ビジネスロジック
│   │   │   ├── __init__.py
│   │   │   ├── pokemon_service.py
│   │   │   ├── move_service.py
│   │   │   ├── battle_service.py
│   │   │   ├── ai_service.py     # LM Studio連携
│   │   │   └── experience_service.py
│   │   │
│   │   └── utils/            # ユーティリティ
│   │       ├── __init__.py
│   │       ├── constants.py  # 定数定義
│   │       └── helpers.py    # ヘルパー関数
│   │
│   ├── alembic/              # マイグレーション
│   │   ├── versions/         # マイグレーションファイル
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   └── tests/                # テスト
│       ├── __init__.py
│       ├── conftest.py       # pytest設定
│       ├── test_pokemon.py
│       ├── test_moves.py
│       ├── test_battle.py
│       └── test_ai.py
│
├── database/                  # データベース関連
│   ├── init.sql              # 初期化SQL
│   └── seed.sql              # シードデータ
│
└── docs/                      # ドキュメント
    ├── api.md                # API仕様書
    ├── setup.md              # セットアップガイド
    └── architecture.md       # アーキテクチャ説明
```

## 3. Docker Compose構成

```yaml
services:
  frontend:
    - ポート: 5173
    - ホットリロード対応

  backend:
    - ポート: 8000
    - FastAPI自動リロード

  postgres:
    - ポート: 5432
    - ボリュームマウント

  # LM Studioは別途起動（ポート11434）
```

## 4. 開発フロー

### 初期セットアップ
1. Docker環境構築
2. データベース初期化
3. LM Studio起動
4. 依存関係インストール

### 開発サイクル
1. フロントエンド: Vite開発サーバー
2. バックエンド: FastAPI自動リロード
3. データベース: Alembicマイグレーション

## 5. 命名規則

### フロントエンド
- **コンポーネント**: PascalCase（例: PokemonCard.tsx）
- **フック**: camelCase with use prefix（例: usePokemon.ts）
- **ユーティリティ**: camelCase（例: formatDate.ts）
- **型定義**: PascalCase（例: PokemonType）
- **定数**: UPPER_SNAKE_CASE（例: MAX_LEVEL）

### バックエンド
- **モジュール**: snake_case（例: pokemon_service.py）
- **クラス**: PascalCase（例: PokemonService）
- **関数**: snake_case（例: get_pokemon_by_id）
- **定数**: UPPER_SNAKE_CASE（例: DEFAULT_POWER）

## 6. 主要な設計パターン

### フロントエンド
- **Component Composition**: 小さく再利用可能なコンポーネント
- **Custom Hooks**: ロジックの分離と再利用
- **Store Pattern**: Zustandによる状態管理
- **Atomic Design**: 段階的なコンポーネント構成

### バックエンド
- **Repository Pattern**: データアクセス層の抽象化
- **Service Layer**: ビジネスロジックの分離
- **Dependency Injection**: FastAPIの依存性注入
- **Schema Validation**: Pydanticによる型安全性

## 7. 開発優先順位

### Phase 1: 基盤構築
- Docker環境セットアップ
- データベース接続
- 基本的なCRUD API
- 最小限のUI

### Phase 2: コア機能
- ポケモン管理機能
- わざ管理機能
- AI威力判定連携

### Phase 3: ゲーム要素
- バトルシステム
- 経験値システム
- レベルアップ・進化

### Phase 4: UI/UX向上
- アニメーション実装
- レスポンシブ対応
- ダーク/ライトモード

### Phase 5: 最適化
- パフォーマンス改善
- エラーハンドリング強化
- テスト充実
