# 状態管理戦略

* Status: 提案
* Deciders: 開発チーム
* Date: 2025-08-07

## Context and Problem Statement

ポケモン風TODOアプリでは、ポケモン情報、タスク（わざ）、バトル状態、UI状態など、複数の関連する状態を管理する必要がある。リアルタイムなバトルアニメーションと非同期API通信を含むため、効率的な状態管理が不可欠。

## Decision Drivers

* **パフォーマンス**: 不要な再レンダリングの防止
* **開発体験**: シンプルで直感的なAPI
* **型安全性**: TypeScriptとの親和性
* **デバッグ容易性**: 状態変更の追跡
* **非同期処理**: API通信とアニメーションの管理

## Considered Options

### Option 1: Zustand + React Query
* Zustandでクライアント状態管理
* React Query (TanStack Query)でサーバー状態管理
* 軽量で学習コストが低い

### Option 2: Redux Toolkit + RTK Query
* 統一された状態管理
* 強力なDevTools
* ボイラープレートが多い

### Option 3: Jotai + SWR
* アトミックな状態管理
* React Suspenseとの親和性
* 実験的な機能への依存

## Decision Outcome

**選択: Option 1 - Zustand + React Query**

### 理由
* **軽量**: バンドルサイズが小さい
* **シンプル**: 少ないボイラープレート
* **柔軟性**: 必要に応じて段階的に複雑化可能
* **実績**: 両ライブラリとも安定性が高い

## Implementation Details

### 1. ストア設計

```typescript
// stores/pokemonStore.ts
interface PokemonStore {
  // State
  pokemons: Pokemon[];
  selectedPokemonId: string | null;

  // Computed
  selectedPokemon: Pokemon | null;

  // Actions
  addPokemon: (pokemon: Pokemon) => void;
  updatePokemon: (id: string, updates: Partial<Pokemon>) => void;
  deletePokemon: (id: string) => void;
  selectPokemon: (id: string | null) => void;

  // Async Actions
  levelUp: (id: string, experience: number) => Promise<void>;
  evolve: (id: string) => Promise<void>;
}

const usePokemonStore = create<PokemonStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      pokemons: [],
      selectedPokemonId: null,

      get selectedPokemon() {
        const id = get().selectedPokemonId;
        return id ? get().pokemons.find(p => p.id === id) || null : null;
      },

      addPokemon: (pokemon) => set((state) => {
        state.pokemons.push(pokemon);
      }),

      updatePokemon: (id, updates) => set((state) => {
        const index = state.pokemons.findIndex(p => p.id === id);
        if (index !== -1) {
          Object.assign(state.pokemons[index], updates);
        }
      }),

      deletePokemon: (id) => set((state) => {
        state.pokemons = state.pokemons.filter(p => p.id !== id);
        if (state.selectedPokemonId === id) {
          state.selectedPokemonId = null;
        }
      }),

      selectPokemon: (id) => set((state) => {
        state.selectedPokemonId = id;
      }),

      levelUp: async (id, experience) => {
        const pokemon = get().pokemons.find(p => p.id === id);
        if (!pokemon) return;

        const newLevel = calculateLevel(pokemon.experience + experience);
        const evolved = checkEvolution(pokemon, newLevel);

        set((state) => {
          const index = state.pokemons.findIndex(p => p.id === id);
          if (index !== -1) {
            state.pokemons[index].experience += experience;
            state.pokemons[index].level = newLevel;
            if (evolved) {
              state.pokemons[index].evolutionStage = evolved.stage;
              state.pokemons[index].sprite = evolved.sprite;
            }
          }
        });
      },

      evolve: async (id) => {
        // 進化ロジック
      }
    }))
  )
);
```

### 2. バトル状態管理

```typescript
// stores/battleStore.ts
interface BattleStore {
  // Battle State
  isInBattle: boolean;
  playerPokemon: Pokemon | null;
  playerMoves: Move[];
  enemy: Enemy | null;
  currentTurn: 'player' | 'enemy';

  // Battle Progress
  playerHP: number;
  enemyHP: number;
  totalDamage: number;

  // Animation State
  animationQueue: BattleAnimation[];
  isAnimating: boolean;

  // Actions
  startBattle: (pokemon: Pokemon, enemy: Enemy) => void;
  selectMove: (move: Move) => void;
  applyDamage: (target: 'player' | 'enemy', damage: number) => void;
  endBattle: (victory: boolean) => void;

  // Animation
  queueAnimation: (animation: BattleAnimation) => void;
  processAnimationQueue: () => Promise<void>;
}

const useBattleStore = create<BattleStore>()((set, get) => ({
  isInBattle: false,
  playerPokemon: null,
  playerMoves: [],
  enemy: null,
  currentTurn: 'player',
  playerHP: 100,
  enemyHP: 100,
  totalDamage: 0,
  animationQueue: [],
  isAnimating: false,

  startBattle: (pokemon, enemy) => set({
    isInBattle: true,
    playerPokemon: pokemon,
    playerMoves: pokemon.moves.filter(m => !m.isCompleted),
    enemy,
    playerHP: 100,
    enemyHP: enemy.hp,
    totalDamage: 0,
    currentTurn: 'player'
  }),

  selectMove: async (move) => {
    const damage = calculateDamage(move.power);

    set((state) => ({
      animationQueue: [
        ...state.animationQueue,
        { type: 'move-select', move },
        { type: 'attack', attacker: 'player', move },
        { type: 'damage', target: 'enemy', amount: damage },
        { type: 'hp-decrease', target: 'enemy', amount: damage }
      ]
    }));

    await get().processAnimationQueue();

    set((state) => ({
      enemyHP: Math.max(0, state.enemyHP - damage),
      totalDamage: state.totalDamage + damage
    }));

    if (get().enemyHP <= 0) {
      get().endBattle(true);
    }
  },

  applyDamage: (target, damage) => set((state) => ({
    ...(target === 'player'
      ? { playerHP: Math.max(0, state.playerHP - damage) }
      : { enemyHP: Math.max(0, state.enemyHP - damage) }
    )
  })),

  endBattle: (victory) => {
    if (victory) {
      const exp = calculateExperience(get().enemy!);
      usePokemonStore.getState().levelUp(get().playerPokemon!.id, exp);
    }

    set({
      isInBattle: false,
      playerPokemon: null,
      enemy: null,
      animationQueue: []
    });
  },

  queueAnimation: (animation) => set((state) => ({
    animationQueue: [...state.animationQueue, animation]
  })),

  processAnimationQueue: async () => {
    set({ isAnimating: true });

    const queue = get().animationQueue;
    for (const animation of queue) {
      await playAnimation(animation);
    }

    set({
      animationQueue: [],
      isAnimating: false
    });
  }
}));
```

### 3. React Query統合

```typescript
// hooks/usePokemonQuery.ts
export const usePokemonQuery = () => {
  return useQuery({
    queryKey: ['pokemons'],
    queryFn: fetchPokemons,
    staleTime: 5 * 60 * 1000, // 5分
    onSuccess: (data) => {
      usePokemonStore.setState({ pokemons: data });
    }
  });
};

export const useCreatePokemonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPokemon,
    onMutate: async (newPokemon) => {
      // Optimistic update
      await queryClient.cancelQueries(['pokemons']);
      const previousPokemons = queryClient.getQueryData(['pokemons']);

      queryClient.setQueryData(['pokemons'], (old: Pokemon[]) => [
        ...old,
        { ...newPokemon, id: 'temp-' + Date.now() }
      ]);

      return { previousPokemons };
    },
    onError: (err, newPokemon, context) => {
      // Rollback
      queryClient.setQueryData(['pokemons'], context?.previousPokemons);
      toast.error('ポケモンの作成に失敗しました');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pokemons']);
      toast.success('ポケモンを作成しました！');
    }
  });
};
```

### 4. セレクター最適化

```typescript
// stores/selectors.ts
export const usePokemonsByType = (type: PokemonType) => {
  return usePokemonStore(
    useShallow((state) =>
      state.pokemons.filter(p => p.type === type)
    )
  );
};

export const useCompletedMovesCount = (pokemonId: string) => {
  return usePokemonStore((state) => {
    const pokemon = state.pokemons.find(p => p.id === pokemonId);
    return pokemon?.moves.filter(m => m.isCompleted).length ?? 0;
  });
};

// パフォーマンス最適化されたセレクター
export const useHighLevelPokemons = () => {
  return usePokemonStore(
    (state) => state.pokemons.filter(p => p.level >= 50),
    shallow
  );
};
```

### 5. DevTools統合

```typescript
// stores/devtools.ts
export const useStoreDevtools = () => {
  if (process.env.NODE_ENV === 'development') {
    const stores = {
      pokemon: usePokemonStore,
      battle: useBattleStore,
      ui: useUIStore,
      theme: useThemeStore
    };

    mountStoreDevtool('PokemonStore', usePokemonStore);
    mountStoreDevtool('BattleStore', useBattleStore);
    mountStoreDevtool('UIStore', useUIStore);
    mountStoreDevtool('ThemeStore', useThemeStore);
  }
};
```

### 6. 永続化設定

```typescript
// stores/persistence.ts
const persistConfig = {
  name: 'pokemon-todo-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: (state: PokemonStore) => ({
    pokemons: state.pokemons,
    selectedPokemonId: state.selectedPokemonId
  }),
  version: 1,
  migrate: (persistedState: any, version: number) => {
    if (version === 0) {
      // マイグレーションロジック
    }
    return persistedState;
  }
};

const usePokemonStore = create<PokemonStore>()(
  persist(
    // ... store implementation
    persistConfig
  )
);
```

### 7. ミドルウェア活用

```typescript
// stores/middleware.ts
const loggerMiddleware = (config: StateCreator<PokemonStore>) =>
  (set: any, get: any, api: any) =>
    config(
      (args) => {
        console.log('Previous state:', get());
        set(args);
        console.log('New state:', get());
      },
      get,
      api
    );

const analyticsMiddleware = (config: StateCreator<PokemonStore>) =>
  (set: any, get: any, api: any) =>
    config(
      (args) => {
        set(args);
        // アナリティクスイベント送信
        trackEvent('state_change', { store: 'pokemon' });
      },
      get,
      api
    );
```

## Consequences

### Good
* シンプルで直感的なAPI
* 優れた型推論
* 小さなバンドルサイズ
* React Query との相性が良い

### Bad
* 大規模アプリケーションでの実績が Redux より少ない
* Time-travel debugging がネイティブサポートされていない

## Links

* [Zustand](https://github.com/pmndrs/zustand)
* [TanStack Query](https://tanstack.com/query)
* [Immer](https://immerjs.github.io/immer/)
