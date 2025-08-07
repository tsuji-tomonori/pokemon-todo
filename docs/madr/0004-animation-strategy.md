# アニメーション実装戦略

## ステータス

承認済み

## メタデータ

* 決定者: 開発チーム
* 日付: 2025-08-08

## Context and Problem Statement

ポケモン風TODOアプリにおいて、ゲーム的な楽しさを演出するためには、流れるようなアニメーションが不可欠。バトルエフェクト、カード遷移、レベルアップ演出など、多様なアニメーションを60fps維持しながら実装する必要がある。

## Decision Drivers

* **パフォーマンス**: 60fps維持、GPU加速の活用
* **表現力**: 複雑なバトルエフェクトの実現
* **開発効率**: 宣言的なアニメーション定義
* **互換性**: モバイル端末での動作保証
* **保守性**: アニメーションロジックの一元管理

## Considered Options

### Option 1: Framer Motion + Canvas/WebGL
* Framer Motion: UIアニメーション
* Canvas/WebGL: パーティクルエフェクト
* 役割分担が明確

### Option 2: Lottie + CSS Animations
* Lottie: 複雑なアニメーション
* CSS: シンプルなトランジション
* デザイナーとの協業が容易

### Option 3: React Spring + Three.js
* React Spring: 物理ベースアニメーション
* Three.js: 3Dエフェクト
* 高度な表現が可能

## Decision Outcome

**選択: Option 1 - Framer Motion + Canvas/WebGL**

### 理由
* **バランス**: UIとエフェクトの両方に対応
* **パフォーマンス**: 適切な技術の使い分け
* **実装コスト**: 妥当な学習曲線
* **実績**: 多くのプロダクションでの採用実績

## Implementation Details

### 1. アニメーション階層設計

```typescript
// 1. マイクロアニメーション（< 300ms）
const microAnimations = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },
  focus: {
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.5)",
    transition: { duration: 0.15 }
  }
};

// 2. UIトランジション（300-600ms）
const uiTransitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  stagger: {
    animate: { transition: { staggerChildren: 0.05 } }
  }
};

// 3. バトルアニメーション（600ms-2s）
const battleAnimations = {
  attack: {
    animate: {
      x: [0, 50, 0],
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.8,
        times: [0, 0.3, 1],
        ease: "easeInOut"
      }
    }
  },
  damage: {
    animate: {
      x: [-5, 5, -5, 5, 0],
      filter: ["brightness(1)", "brightness(2)", "brightness(0.5)", "brightness(1)"],
      transition: { duration: 0.5 }
    }
  }
};

// 4. 特殊演出（> 2s）
const specialEffects = {
  levelUp: {
    animate: {
      scale: [1, 1.5, 1.2],
      rotate: [0, 360],
      filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"],
      transition: {
        duration: 3,
        ease: "easeInOut"
      }
    }
  }
};
```

### 2. パーティクルシステム実装

```typescript
// utils/particleSystem.ts
class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupCanvas();
  }

  emit(config: ParticleConfig) {
    for (let i = 0; i < config.count; i++) {
      this.particles.push(new Particle({
        x: config.x + (Math.random() - 0.5) * config.spread,
        y: config.y,
        vx: (Math.random() - 0.5) * config.velocity.x,
        vy: Math.random() * config.velocity.y,
        size: config.size + Math.random() * config.sizeVariation,
        color: config.color,
        lifetime: config.lifetime,
        gravity: config.gravity ?? 0.1
      }));
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter(particle => {
      particle.update();
      particle.draw(this.ctx);
      return particle.isAlive();
    });

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate);
    } else {
      this.animationId = null;
    }
  };
}

// React Hook
export const useParticleEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<ParticleSystem>();

  useEffect(() => {
    if (canvasRef.current) {
      systemRef.current = new ParticleSystem(canvasRef.current);
    }
  }, []);

  const emit = useCallback((config: ParticleConfig) => {
    systemRef.current?.emit(config);
  }, []);

  return { canvasRef, emit };
};
```

### 3. バトルシーケンス管理

```typescript
// hooks/useBattleAnimation.ts
interface AnimationStep {
  type: 'move' | 'effect' | 'damage' | 'status';
  target: 'player' | 'enemy';
  duration: number;
  animation: MotionProps;
  particles?: ParticleConfig;
  sound?: string;
}

export const useBattleAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { emit } = useParticleEffect();

  const playSequence = async (steps: AnimationStep[]) => {
    setIsAnimating(true);

    for (const step of steps) {
      await Promise.all([
        // Framer Motion アニメーション
        animate(step.target, step.animation),

        // パーティクルエフェクト
        step.particles && emit(step.particles),

        // サウンド再生
        step.sound && playSound(step.sound),

        // 待機時間
        delay(step.duration)
      ]);
    }

    setIsAnimating(false);
  };

  const executeMoveAnimation = async (move: Move, target: 'enemy') => {
    const sequence: AnimationStep[] = [
      // 1. 構え
      {
        type: 'move',
        target: 'player',
        duration: 300,
        animation: {
          scale: 1.1,
          x: -10
        }
      },
      // 2. 攻撃
      {
        type: 'move',
        target: 'player',
        duration: 500,
        animation: {
          x: 50,
          scale: 1.2
        },
        particles: {
          count: 20,
          x: 300,
          y: 200,
          velocity: { x: 10, y: -5 },
          color: TYPE_COLORS[move.type],
          lifetime: 1000,
          size: 5,
          spread: 30
        },
        sound: 'attack'
      },
      // 3. ダメージ
      {
        type: 'damage',
        target: 'enemy',
        duration: 400,
        animation: {
          x: [0, -10, 10, -10, 0],
          filter: ['brightness(1)', 'brightness(2)', 'brightness(0.5)', 'brightness(1)']
        },
        particles: {
          count: 30,
          x: 500,
          y: 200,
          velocity: { x: 5, y: -10 },
          color: '#ff4444',
          lifetime: 800,
          size: 3,
          spread: 50
        },
        sound: 'hit'
      },
      // 4. 戻る
      {
        type: 'move',
        target: 'player',
        duration: 300,
        animation: {
          x: 0,
          scale: 1
        }
      }
    ];

    await playSequence(sequence);
  };

  return { isAnimating, executeMoveAnimation };
};
```

### 4. スクロール連動アニメーション

```typescript
// hooks/useScrollAnimation.ts
export const useScrollAnimation = () => {
  const { scrollY } = useScroll();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  // パララックス効果
  const parallaxY = useTransform(scrollY, [0, 500], [0, -100]);
  const parallaxOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // スクロール出現アニメーション
  const revealAnimation = {
    initial: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    animate: inView ? {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    } : {}
  };

  return { ref, parallaxY, parallaxOpacity, revealAnimation };
};
```

### 5. ジェスチャーアニメーション

```typescript
// components/DraggableCard.tsx
const DraggableCard: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.2}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      whileDrag={{
        scale: 1.1,
        rotate: isDragging ? 5 : 0,
        boxShadow: "0px 10px 30px rgba(0,0,0,0.3)"
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      animate={{
        rotate: isDragging ? [0, -5, 5, -5, 0] : 0
      }}
      transition={{
        rotate: {
          duration: 0.5,
          repeat: isDragging ? Infinity : 0
        }
      }}
    >
      <PokemonCard pokemon={pokemon} />
    </motion.div>
  );
};
```

### 6. パフォーマンス最適化

```typescript
// utils/animationOptimization.ts
export const optimizedAnimationConfig = {
  // GPU加速プロパティのみ使用
  transform: true,
  opacity: true,
  filter: true,

  // 避けるべきプロパティ
  avoid: ['width', 'height', 'padding', 'margin', 'top', 'left'],

  // will-change の適切な使用
  willChange: 'transform, opacity',

  // アニメーション中のポインターイベント無効化
  pointerEvents: 'none'
};

// デバイス判定によるアニメーション調整
export const getAnimationConfig = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency <= 4;

  if (isMobile || isLowEnd) {
    return {
      reduceMotion: true,
      particleCount: 10, // 通常の1/3
      animationDuration: 0.5, // 通常の半分
      disableBlur: true
    };
  }

  return {
    reduceMotion: false,
    particleCount: 30,
    animationDuration: 1,
    disableBlur: false
  };
};

// アニメーション無効化設定への対応
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  return prefersReducedMotion ? 'reduced' : 'full';
};
```

### 7. アニメーションテスト

```typescript
// tests/animations.test.ts
describe('Battle Animations', () => {
  it('should complete attack sequence within 2 seconds', async () => {
    const { result } = renderHook(() => useBattleAnimation());

    const startTime = Date.now();
    await result.current.executeMoveAnimation(mockMove, 'enemy');
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(2000);
    expect(result.current.isAnimating).toBe(false);
  });

  it('should maintain 60fps during particle animation', () => {
    const system = new ParticleSystem(document.createElement('canvas'));
    const frameRate = measureFrameRate(() => {
      system.emit({ count: 100, /* ... */ });
    });

    expect(frameRate).toBeGreaterThanOrEqual(60);
  });
});
```

## Consequences

### Good
* 豊富な表現力とパフォーマンスの両立
* 宣言的なアニメーション定義
* デバイスに応じた最適化が可能
* テスト可能な実装

### Bad
* Canvas APIの学習コストがある
* 複雑なアニメーションのデバッグが困難
* バンドルサイズの増加

## Links

* [Framer Motion Documentation](https://www.framer.com/motion/)
* [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
* [GPU Accelerated Animations](https://web.dev/animations-gpu/)
