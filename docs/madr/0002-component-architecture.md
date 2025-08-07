# コンポーネント設計方針

## ステータス

承認済み

## メタデータ

* 決定者: 開発チーム
* 日付: 2025-08-08

## Context and Problem Statement

ポケモン風TODOアプリにおいて、ゲーム要素と実用的なタスク管理機能を組み合わせた複雑なUIを、保守性高く実装する必要がある。再利用性とパフォーマンスを両立させるコンポーネント設計が求められる。

## Decision Drivers

* **再利用性**: 共通コンポーネントの効率的な活用
* **型安全性**: TypeScriptによる堅牢な実装
* **パフォーマンス**: 不要な再レンダリングの防止
* **デザイン一貫性**: ネオモーフィズム×ピクセルアートの統一感
* **アクセシビリティ**: WCAG AA基準準拠

## Considered Options

### Option 1: Atomic Design + Composition Pattern
* 段階的なコンポーネント構成
* プロップスドリリングの最小化
* Compound Componentsパターン

### Option 2: Feature-based Structure
* 機能単位でのコンポーネント管理
* 高凝集・低結合

### Option 3: Presentational/Container Pattern
* ロジックと表示の完全分離
* HOCによる機能拡張

## Decision Outcome

**選択: Option 1 - Atomic Design + Composition Pattern**

### 理由
* UIの複雑さに対して段階的な抽象化が有効
* ゲーム要素の組み合わせに適している
* デザインシステムとの親和性が高い

## Implementation Details

### 1. コンポーネント階層

```typescript
// Atoms - 最小単位のコンポーネント
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  haptic?: boolean; // 触覚フィードバック
}

// Molecules - Atomsの組み合わせ
interface PokemonCardProps {
  pokemon: Pokemon;
  isSelected?: boolean;
  onSelect?: () => void;
  animationDelay?: number;
}

// Organisms - 独立した機能単位
interface BattleScreenProps {
  playerPokemon: Pokemon;
  enemyPokemon: Enemy;
  onMoveSelect: (move: Move) => void;
}
```

### 2. Compound Components パターン

```typescript
// 複雑なコンポーネントの実装例
const PokemonDetail = {
  Root: PokemonDetailRoot,
  Header: PokemonDetailHeader,
  Stats: PokemonDetailStats,
  MoveList: PokemonDetailMoveList,
  Actions: PokemonDetailActions
};

// 使用例
<PokemonDetail.Root pokemon={pokemon}>
  <PokemonDetail.Header />
  <PokemonDetail.Stats showExperience />
  <PokemonDetail.MoveList
    onMoveComplete={handleMoveComplete}
    renderMove={(move) => <CustomMoveCard move={move} />}
  />
  <PokemonDetail.Actions />
</PokemonDetail.Root>
```

### 3. スタイリング戦略

```typescript
// Tailwind CSS + CSS-in-TS
const styles = {
  card: {
    base: "relative overflow-hidden rounded-xl transition-all duration-300",
    neumorphic: {
      light: "bg-white/70 backdrop-blur-md shadow-[-.5rem_-.5rem_1rem_#fff,.5rem_.5rem_1rem_#d1d5db]",
      dark: "bg-gray-800/80 backdrop-blur-md shadow-[-.5rem_-.5rem_1rem_#2a2d35,.5rem_.5rem_1rem_#0a0b0f]"
    },
    hover: "hover:scale-105 hover:shadow-2xl",
    type: {
      fire: "bg-gradient-to-br from-orange-400 to-red-500",
      water: "bg-gradient-to-br from-blue-400 to-blue-600",
      grass: "bg-gradient-to-br from-green-400 to-green-600",
      // ... 他のタイプ
    }
  }
};
```

### 4. アニメーション実装

```typescript
// Framer Motion統合
const cardVariants = {
  initial: {
    opacity: 0,
    y: 20,
    rotateX: -15
  },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.95,
    rotateZ: [-1, 1, -1, 0],
    transition: { duration: 0.2 }
  }
};

// パーティクルエフェクト
const BattleEffect: React.FC<{ type: MoveType }> = ({ type }) => {
  return (
    <Canvas>
      <ParticleSystem
        count={100}
        color={TYPE_COLORS[type]}
        velocity={{ x: [-5, 5], y: [-10, -2] }}
        lifetime={1000}
      />
    </Canvas>
  );
};
```

### 5. パフォーマンス最適化

```typescript
// メモ化戦略
const PokemonCard = React.memo(({ pokemon, onSelect }) => {
  // 高コストな計算のメモ化
  const powerStats = useMemo(() =>
    calculatePowerStats(pokemon.moves),
    [pokemon.moves]
  );

  // コールバックのメモ化
  const handleClick = useCallback(() => {
    onSelect(pokemon.id);
  }, [pokemon.id, onSelect]);

  return <Card onClick={handleClick}>{/* ... */}</Card>;
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return prevProps.pokemon.id === nextProps.pokemon.id &&
         prevProps.pokemon.level === nextProps.pokemon.level;
});
```

### 6. 責務分離

```typescript
// Presentational Component
const PokemonCardView: React.FC<ViewProps> = ({
  pokemon,
  isLoading,
  onAction
}) => (
  <div className={styles.card.base}>
    {/* 純粋な表示ロジック */}
  </div>
);

// Container Component (Custom Hook)
const usePokemonCard = (pokemonId: string) => {
  const pokemon = usePokemonStore(state =>
    state.pokemons.find(p => p.id === pokemonId)
  );
  const { mutate, isLoading } = useMutation(updatePokemon);

  return { pokemon, isLoading, updatePokemon: mutate };
};

// 統合
const PokemonCard: React.FC<{ id: string }> = ({ id }) => {
  const props = usePokemonCard(id);
  return <PokemonCardView {...props} />;
};
```

### 7. アクセシビリティ実装

```typescript
interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'aria-busy'?: boolean;
}

const Button: React.FC<AccessibleButtonProps> = ({
  children,
  isLoading,
  ...props
}) => (
  <button
    {...props}
    aria-busy={isLoading}
    disabled={isLoading || props.disabled}
    className={cn(
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      props.className
    )}
  >
    {isLoading ? <LoadingSpinner /> : children}
  </button>
);
```

### 8. テスト可能な設計

```typescript
// テスト用のProvider
export const TestProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </QueryClientProvider>
);

// コンポーネントテスト
describe('PokemonCard', () => {
  it('should display pokemon information', () => {
    render(
      <TestProvider>
        <PokemonCard pokemon={mockPokemon} />
      </TestProvider>
    );

    expect(screen.getByText(mockPokemon.name)).toBeInTheDocument();
    expect(screen.getByText(`Lv.${mockPokemon.level}`)).toBeInTheDocument();
  });
});
```

## Consequences

### Good
* 高い再利用性と保守性
* 一貫したデザインシステム
* パフォーマンスの最適化が容易
* テストが書きやすい

### Bad
* 初期の学習コストが高い
* 小規模な変更でも複数ファイルの修正が必要な場合がある

## Links

* [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
* [React Patterns](https://reactpatterns.com/)
* [Framer Motion Best Practices](https://www.framer.com/motion/)
