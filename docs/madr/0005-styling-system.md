# スタイリングシステム設計

## ステータス

承認済み

## メタデータ

* 決定者: 開発チーム
* 日付: 2025-08-08

## Context and Problem Statement

ポケモン風TODOアプリにおいて、ネオモーフィズム×ピクセルアート×グラスモーフィズムという独特なビジュアルスタイルを、保守性を保ちながら実装する必要がある。ダーク/ライトモード対応と、ポケモンタイプ別のカラーバリエーションも考慮する。

詳細なデザイン仕様は`requirements.md`の「6. UI/UX要件」を参照。

## Decision Drivers

* **デザイン一貫性**: デザインシステムの厳密な適用
* **開発効率**: 素早いスタイル変更とプロトタイピング
* **パフォーマンス**: CSSバンドルサイズの最適化
* **保守性**: スタイルの再利用性と管理のしやすさ
* **レスポンシブ**: モバイルファースト設計

## Considered Options

### Option 1: Tailwind CSS + CSS-in-JS (emotion/styled-components)
* ユーティリティファーストとコンポーネントスタイルの併用
* 柔軟性が高い

### Option 2: Pure Tailwind CSS + Custom CSS
* Tailwindの拡張機能を最大限活用
* シンプルな構成

### Option 3: CSS Modules + PostCSS
* スコープ化されたスタイル
* 従来のCSS記法

## Decision Outcome

**選択: Option 2 - Pure Tailwind CSS + Custom CSS**

### 理由
* **シンプルさ**: 追加のランタイム不要
* **パフォーマンス**: PurgeCSSによる未使用CSSの削除
* **統一性**: 単一のスタイリング手法
* **拡張性**: Tailwind設定による柔軟なカスタマイズ

## Implementation Details

### 1. Tailwind設定

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ブランドカラー
        primary: {
          50: '#fef2f2',
          // ... 省略
          900: '#7f1d1d',
        },

        // ポケモンタイプ別カラー（requirements.md参照）
        // カラー値は requirements.md の「ポケモンタイプ別カラー」セクションを参照
        ...TYPE_COLORS,

        // グラスモーフィズム用
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(30, 33, 40, 0.8)',
        },
      },

      fontFamily: {
        pixel: ['DotGothic16', 'Press Start 2P', 'monospace'],
        sans: ['Noto Sans JP', 'sans-serif'],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },

      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },

      boxShadow: {
        // ネオモーフィズム（ライトモード）
        'neo-light': '-8px -8px 16px #FFFFFF, 8px 8px 16px #D1D5DB',
        'neo-light-inset': 'inset -8px -8px 16px #FFFFFF, inset 8px 8px 16px #D1D5DB',

        // ネオモーフィズム（ダークモード）
        'neo-dark': '-8px -8px 16px #2A2D35, 8px 8px 16px #0A0B0F',
        'neo-dark-inset': 'inset -8px -8px 16px #2A2D35, inset 8px 8px 16px #0A0B0F',

        // エレベーション
        'elevation-1': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'elevation-2': '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
        'elevation-3': '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
        'elevation-4': '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
      },

      backgroundImage: {
        // タイプ別グラデーション
        'type-gradient-fire': 'linear-gradient(135deg, #F08030 0%, #F5AC78 100%)',
        'type-gradient-water': 'linear-gradient(135deg, #6890F0 0%, #9DB7F5 100%)',
        'type-gradient-grass': 'linear-gradient(135deg, #78C850 0%, #A7DB8D 100%)',
        // ... 他のタイプ
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),

    // カスタムユーティリティ
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-pixel': {
          fontFamily: theme('fontFamily.pixel'),
          imageRendering: 'pixelated',
          fontSmooth: 'never',
          '-webkit-font-smoothing': 'none',
        },
        '.glass': {
          background: theme('colors.glass.light'),
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
        },
        '.glass-dark': {
          background: theme('colors.glass.dark'),
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
```

### 2. グローバルスタイル

```css
/* src/index.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* フォント定義 */
@font-face {
  font-family: 'DotGothic16';
  src: url('/fonts/DotGothic16-Regular.woff2') format('woff2');
  font-display: swap;
}

@layer base {
  :root {
    --color-primary: theme('colors.blue.500');
    --animation-duration: 300ms;
    --animation-timing: cubic-bezier(0.4, 0, 0.2, 1);
  }

  html {
    @apply antialiased;
    text-rendering: optimizeLegibility;
  }

  body {
    @apply bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950;
    @apply text-gray-900 dark:text-gray-100;
  }

  /* スクロールバーカスタマイズ */
  ::-webkit-scrollbar {
    @apply w-2 h-2;
  }

  ::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-gray-800 rounded-full;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-gray-400 dark:bg-gray-600 rounded-full;
    @apply hover:bg-gray-500 dark:hover:bg-gray-500;
  }
}

@layer components {
  /* ネオモーフィックカード */
  .neo-card {
    @apply bg-white dark:bg-gray-800;
    @apply shadow-neo-light dark:shadow-neo-dark;
    @apply rounded-xl p-6;
    @apply transition-all duration-300;
  }

  .neo-card-pressed {
    @apply shadow-neo-light-inset dark:shadow-neo-dark-inset;
  }

  /* グラスモーフィックカード */
  .glass-card {
    @apply glass dark:glass-dark;
    @apply backdrop-blur-md rounded-xl;
    @apply border border-white/20 dark:border-gray-700/30;
    @apply shadow-elevation-2;
  }

  /* ピクセルボタン */
  .pixel-button {
    @apply font-pixel text-sm px-4 py-2;
    @apply bg-blue-500 hover:bg-blue-600;
    @apply text-white;
    @apply transform hover:scale-105 active:scale-95;
    @apply transition-all duration-150;
    image-rendering: pixelated;
    box-shadow:
      0 4px 0 rgb(37, 99, 235),
      0 6px 4px rgba(0, 0, 0, 0.25);
  }

  .pixel-button:active {
    box-shadow:
      0 2px 0 rgb(37, 99, 235),
      0 3px 2px rgba(0, 0, 0, 0.25);
    transform: translateY(2px) scale(0.95);
  }

  /* タイプバッジ */
  .type-badge {
    @apply inline-flex items-center px-3 py-1;
    @apply rounded-full text-xs font-bold;
    @apply uppercase tracking-wider;
  }

  /* HPバー */
  .hp-bar {
    @apply relative w-full h-6 bg-gray-300 dark:bg-gray-700;
    @apply rounded-full overflow-hidden;
  }

  .hp-bar-fill {
    @apply absolute inset-y-0 left-0;
    @apply transition-all duration-500 ease-out;
  }

  .hp-bar-fill.high {
    @apply bg-gradient-to-r from-green-400 to-green-500;
  }

  .hp-bar-fill.medium {
    @apply bg-gradient-to-r from-yellow-400 to-yellow-500;
  }

  .hp-bar-fill.low {
    @apply bg-gradient-to-r from-red-400 to-red-500;
  }
}

@layer utilities {
  /* アニメーション無効化対応 */
  @media (prefers-reduced-motion: reduce) {
    .motion-safe\:animate-none {
      animation: none !important;
    }

    .motion-safe\:transition-none {
      transition: none !important;
    }
  }

  /* パフォーマンス最適化 */
  .gpu-accelerate {
    transform: translateZ(0);
    will-change: transform;
  }

  .no-tap-highlight {
    -webkit-tap-highlight-color: transparent;
  }

  /* ピクセルアート表示 */
  .pixelated {
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-crisp-edges;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
}
```

### 3. コンポーネント別スタイル管理

```typescript
// utils/styles.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// スタイル定数
export const styles = {
  card: {
    base: 'neo-card hover:shadow-elevation-3 transition-shadow duration-300',
    pokemon: (type: PokemonType) => cn(
      'relative overflow-hidden',
      `bg-type-gradient-${type}`,
      'before:absolute before:inset-0',
      'before:bg-white/10 before:backdrop-blur-sm'
    ),
    move: 'glass-card p-4 cursor-pointer hover:scale-105'
  },

  button: {
    primary: 'pixel-button bg-blue-500 hover:bg-blue-600',
    secondary: 'pixel-button bg-gray-500 hover:bg-gray-600',
    danger: 'pixel-button bg-red-500 hover:bg-red-600',
    success: 'pixel-button bg-green-500 hover:bg-green-600',
    ghost: cn(
      'font-pixel text-sm px-4 py-2',
      'text-gray-700 dark:text-gray-300',
      'hover:bg-gray-100 dark:hover:bg-gray-800',
      'transition-colors duration-200'
    ),
  },

  input: {
    base: cn(
      'w-full px-4 py-2 rounded-lg',
      'bg-white dark:bg-gray-800',
      'border-2 border-gray-300 dark:border-gray-600',
      'focus:border-blue-500 dark:focus:border-blue-400',
      'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
      'transition-all duration-200'
    ),
    error: 'border-red-500 dark:border-red-400',
    success: 'border-green-500 dark:border-green-400',
  },

  animation: {
    fadeIn: 'animate-in fade-in duration-300',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-400',
    bounce: 'animate-bounce-slow',
    pulse: 'animate-pulse-slow',
  },
};

// タイプ別カラーマップ（requirements.mdから取得）
// カラー値の詳細は requirements.md の「ポケモンタイプ別カラー」セクションを参照
import { TYPE_COLORS } from '../utils/constants';
```

### 4. レスポンシブデザイン

```typescript
// components/ResponsiveGrid.tsx
interface ResponsiveGridProps {
  children: React.ReactNode;
  variant?: 'cards' | 'list' | 'masonry';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  variant = 'cards'
}) => {
  const gridClasses = {
    cards: cn(
      'grid gap-4',
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4',
      '2xl:grid-cols-5'
    ),
    list: 'flex flex-col gap-3',
    masonry: cn(
      'columns-1',
      'sm:columns-2',
      'lg:columns-3',
      'xl:columns-4',
      'gap-4'
    ),
  };

  return (
    <div className={gridClasses[variant]}>
      {children}
    </div>
  );
};
```

### 5. テーマ管理

```typescript
// hooks/useTheme.ts
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    if (theme === 'system') {
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return { theme, setTheme };
};
```

### 6. パフォーマンス最適化

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    '@fullhuman/postcss-purgecss': process.env.NODE_ENV === 'production' ? {
      content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: [/^type-/, /^hp-bar/],
        deep: [/glass$/, /neo-/],
        greedy: [/^animate-/]
      }
    } : false,
    'cssnano': process.env.NODE_ENV === 'production' ? {
      preset: ['default', {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
      }]
    } : false,
  },
};
```

## Consequences

### Good
* 統一されたスタイリング手法
* 優れた開発体験とオートコンプリート
* PurgeCSSによる最小限のCSSバンドル
* カスタマイズが容易

### Bad
* Tailwindクラス名が長くなりがち
* 動的クラス名の生成に制限がある
* 初期学習コストがある

## Links

* [Tailwind CSS Documentation](https://tailwindcss.com/docs)
* [Tailwind CSS Best Practices](https://www.simonswiss.com/articles/tailwindcss-best-practices)
* [Neumorphism Design](https://neumorphism.io/)
