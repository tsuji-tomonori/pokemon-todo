# ポケモン風TODOアプリ

ポケモンの世界観を取り入れたゲーミフィケーションTODOアプリ。タスクを楽しく管理してポケモンを育成しよう！

## 概要

- **親タスク**: ポケモン（カテゴリー別）
- **子タスク**: わざ（具体的なTODO）
- **バトルシステム**: タスク完了で敵にダメージ
- **成長システム**: 経験値でレベルアップ・進化

## 技術スタック

- **フロントエンド**: React
- **バックエンド**: FastAPI
- **データベース**: PostgreSQL
- **AI**: LM Studio (google/gemma-3n-e4b)
- **実行環境**: Docker Compose

## 主な機能

- ポケモン（親タスク）の作成・管理
- わざ（子タスク）の追加・完了
- AI自動威力計算
- シンプルなバトルシステム
- レベルアップ・進化システム

## 実行方法

```bash
# LM Studio起動（ポート1234）
# Docker Compose起動
docker-compose up -d
```

## API

- `/api/pokemon` - ポケモン管理
- `/api/moves` - わざ管理
- `/api/ai/calculate-power` - AI威力計算
- `/api/battles` - バトル処理

詳細は `requirements.md` を参照。
