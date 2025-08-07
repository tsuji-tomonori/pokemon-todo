# Phase 2: コア機能

**期間**: 4-5日
**目標**: ポケモンとわざの管理機能完成、AI連携実装

## 概要

Phase1で構築した基盤の上に、AI連携によるわざ威力計算機能と、完全なポケモン・わざ管理システムを実装します。ユーザーフレンドリーなインターフェースと堅牢な状態管理も含まれます。

## Day 1: AI連携システム実装

### LM Studio連携 (4-5時間)

#### AI Service実装
- [ ] `services/ai_service.py` - LM Studio連携サービス
  - HTTPクライアント設定（httpx使用）
  - プロンプト生成機能
  - 威力計算ロジック
  - エラーハンドリング・リトライ機能

#### AI API エンドポイント
- [ ] `api/v1/ai.py` 実装
  - `POST /api/v1/ai/calculate-power` - わざ威力自動計算
  - リクエスト/レスポンススキーマ定義
  - バリデーション実装

#### プロンプトエンジニアリング
- [ ] 威力計算プロンプト最適化
- [ ] 難易度判定ロジック実装
- [ ] 結果パース・検証機能

**成果物**: AI連携基盤

### Frontend AI統合 (3-4時間)

#### AI API統合
- [ ] `api/ai.ts` - AI APIクライアント
- [ ] `hooks/useAI.ts` - AI機能カスタムフック
- [ ] Loading/Error状態管理

#### Move作成UI改善
- [ ] `components/moves/MoveForm.tsx` 拡張
  - AI威力計算ボタン
  - リアルタイムプレビュー
  - 威力調整UI

**成果物**: AI統合Move作成機能

### LM Studio設定とテスト (1-2時間)
- [ ] LM Studio接続設定確認
- [ ] google/gemma-3n-e4b モデル動作確認
- [ ] API レスポンス精度テスト
- [ ] エラーケーステスト

## Day 2: 高度な状態管理実装

### Zustand Store拡張 (4-5時間)

#### PokemonStore完成
- [ ] `stores/pokemonStore.ts` 完全実装（[状態管理MADR](../madr/0003-state-management.md)参照）
  - CRUD操作
  - セレクター最適化
  - 楽観的更新
  - エラー状態管理

#### 新規Store実装
- [ ] `stores/uiStore.ts` - UI状態管理
  - モーダル状態
  - トースト通知
  - ローディング状態
  - フォーム状態

#### ミドルウェア実装
- [ ] 永続化設定（localStorage）
- [ ] DevTools統合
- [ ] ログミドルウェア

**成果物**: 完全な状態管理システム

### React Query統合 (3-4時間)

#### データフェッチング最適化
- [ ] `hooks/usePokemonQuery.ts` - Pokemon クエリフック
- [ ] `hooks/useMoveQuery.ts` - Move クエリフック
- [ ] キャッシュ戦略設定
- [ ] バックグラウンド更新設定

#### Mutation実装
- [ ] 楽観的更新
- [ ] エラーハンドリング
- [ ] 成功通知統合

**成果物**: 最適化されたデータ管理

## Day 3: 高度なUI コンポーネント

### 共通コンポーネント実装 (4-5時間)

#### Base Components
- [ ] `components/common/Modal.tsx` - モーダルコンポーネント
- [ ] `components/common/Toast.tsx` - 通知コンポーネント
- [ ] `components/common/LoadingSpinner.tsx` - ローディング表示
- [ ] `components/common/ProgressBar.tsx` - プログレスバー

#### 高度なInput Components
- [ ] `components/common/Select.tsx` - セレクトボックス
- [ ] `components/common/TextArea.tsx` - テキストエリア
- [ ] フォームバリデーション統合

**成果物**: 再利用可能なコンポーネントライブラリ

### Pokemon専用コンポーネント (3-4時間)

#### Pokemon詳細コンポーネント
- [ ] `components/pokemon/PokemonDetail.tsx` - 詳細表示
- [ ] `components/pokemon/PokemonForm.tsx` - 編集フォーム
- [ ] `components/pokemon/LevelIndicator.tsx` - レベル表示
- [ ] `components/pokemon/TypeBadge.tsx` - タイプバッジ

#### Move専用コンポーネント
- [ ] `components/moves/PowerGauge.tsx` - 威力ゲージ
- [ ] `components/moves/MoveCompleteButton.tsx` - 完了ボタン
- [ ] Compound Components パターン実装

**成果物**: 完全なPokemon/Move UI

## Day 4: バリデーションとエラーハンドリング

### Backend強化 (4-5時間)

#### バリデーション強化
- [ ] Pydanticスキーマ詳細バリデーション
- [ ] カスタムバリデーター実装
- [ ] ビジネスルールバリデーション

#### エラーハンドリング改善
- [ ] `core/exceptions.py` - カスタム例外クラス
- [ ] グローバルエラーハンドラー
- [ ] 構造化エラーレスポンス
- [ ] ログ設定改善

#### セキュリティ強化
- [ ] 入力サニタイゼーション
- [ ] レート制限設定
- [ ] CORS詳細設定

**成果物**: 堅牢なBackend

### Frontend バリデーション (3-4時間)

#### フォームバリデーション
- [ ] `utils/validators.ts` - バリデーション関数
- [ ] リアルタイムバリデーション
- [ ] エラーメッセージ表示
- [ ] 送信前チェック

#### エラーハンドリング
- [ ] エラーバウンダリ実装
- [ ] API エラー統一処理
- [ ] ユーザーフレンドリーなエラー表示

**成果物**: 高品質なユーザー体験

## Day 5: 統合とポリッシュ

### 機能統合テスト (3-4時間)

#### End-to-End テスト
- [ ] ポケモン作成→わざ追加→AI威力計算のフロー
- [ ] エラーケーステスト
- [ ] 大量データでの動作確認
- [ ] パフォーマンステスト

#### ユーザビリティテスト
- [ ] UIフロー確認
- [ ] 操作性チェック
- [ ] エラーメッセージ適切性確認

**成果物**: 安定した統合システム

### UI/UXポリッシュ (4-5時間)

#### スタイリング完成
- [ ] ネオモーフィズムスタイル適用
- [ ] タイプ別カラーリング完成
- [ ] ダーク/ライトモード基本対応
- [ ] アニメーション基盤実装

#### レスポンシブデザイン
- [ ] モバイル最適化
- [ ] タブレット表示調整
- [ ] デスクトップ詳細レイアウト

#### アクセシビリティ基盤
- [ ] キーボードナビゲーション
- [ ] スクリーンリーダー対応
- [ ] コントラスト確認

**成果物**: 洗練されたUI

## 完了基準

### 機能要件
- [ ] AI連携によるわざ威力計算が正常動作
- [ ] ポケモン・わざの完全な管理機能
- [ ] 堅牢なバリデーションとエラーハンドリング
- [ ] 優れたユーザーエクスペリエンス

### 技術要件
- [ ] 状態管理が最適化済み
- [ ] パフォーマンスが許容範囲内
- [ ] エラーが適切にハンドリングされる
- [ ] セキュリティ基準を満たす

### 品質要件
- [ ] LM Studio連携が安定動作
- [ ] UIが直感的で使いやすい
- [ ] レスポンシブデザインが適切
- [ ] アクセシビリティが基本レベル達成

## 技術的詳細

### 新規技術要素
- **LM Studio API**: HTTP通信でのAI連携
- **React Query**: サーバー状態管理
- **Zustand Advanced**: ミドルウェア活用
- **Advanced Validation**: フロント・バック両面

### パフォーマンス目標
- **AI API応答**: 3秒以内
- **UI操作応答**: 300ms以内
- **データフェッチ**: 1秒以内

## トラブルシューティング

### AI連携の問題
1. **LM Studio未起動**: ポート1234確認
2. **モデル未ロード**: google/gemma-3n-e4b確認
3. **API timeout**: タイムアウト設定調整

### 状態管理の問題
1. **状態同期エラー**: DevToolsで状態確認
2. **メモリリーク**: useEffect cleanup確認
3. **パフォーマンス劣化**: React Profiler使用

## 次のステップ

Phase2完了後は[Phase3: ゲーム要素](./phase3-game-elements.md)でバトルシステムを実装します。

---

**参照ドキュメント**:
- [状態管理戦略MADR](../madr/0003-state-management.md)
- [コンポーネント設計MADR](../madr/0002-component-architecture.md)
- [バックエンドアーキテクチャMADR](../madr/0001-backend-architecture.md)
