import React from 'react';
import { clsx } from 'clsx';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'soft';
  showIcon?: boolean;
  className?: string;
}

const typeEmojis: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  psychic: '🔮',
  ice: '❄️',
  dragon: '🐲',
  dark: '🌙',
  fairy: '✨',
  fighting: '👊',
  poison: '☠️',
  ground: '🌍',
  flying: '🪶',
  bug: '🐛',
  rock: '🗿',
  ghost: '👻',
  steel: '⚙️',
  normal: '⚪'
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  normal: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-300 dark:border-gray-600'
  },
  fire: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-600'
  },
  water: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-600'
  },
  electric: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-600'
  },
  grass: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-300 dark:border-green-600'
  },
  ice: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/20',
    text: 'text-cyan-800 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-600'
  },
  fighting: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-600'
  },
  poison: {
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-600'
  },
  ground: {
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-600'
  },
  flying: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    text: 'text-indigo-800 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-600'
  },
  psychic: {
    bg: 'bg-pink-100 dark:bg-pink-900/20',
    text: 'text-pink-800 dark:text-pink-300',
    border: 'border-pink-300 dark:border-pink-600'
  },
  bug: {
    bg: 'bg-lime-100 dark:bg-lime-900/20',
    text: 'text-lime-800 dark:text-lime-300',
    border: 'border-lime-300 dark:border-lime-600'
  },
  rock: {
    bg: 'bg-stone-100 dark:bg-stone-900/20',
    text: 'text-stone-800 dark:text-stone-300',
    border: 'border-stone-300 dark:border-stone-600'
  },
  ghost: {
    bg: 'bg-violet-100 dark:bg-violet-900/20',
    text: 'text-violet-800 dark:text-violet-300',
    border: 'border-violet-300 dark:border-violet-600'
  },
  dragon: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    text: 'text-indigo-800 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-600'
  },
  dark: {
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    text: 'text-gray-800 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-600'
  },
  steel: {
    bg: 'bg-slate-100 dark:bg-slate-900/20',
    text: 'text-slate-800 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-600'
  },
  fairy: {
    bg: 'bg-pink-100 dark:bg-pink-900/20',
    text: 'text-pink-800 dark:text-pink-300',
    border: 'border-pink-300 dark:border-pink-600'
  }
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const TypeBadge: React.FC<TypeBadgeProps> = ({
  type,
  size = 'md',
  variant = 'solid',
  showIcon = true,
  className
}) => {
  const colors = typeColors[type.toLowerCase()] || typeColors.normal;
  const emoji = typeEmojis[type.toLowerCase()] || '🎮';

  const variantClasses = {
    solid: colors.bg,
    outline: `border-2 ${colors.border} bg-transparent`,
    soft: `${colors.bg} bg-opacity-50`,
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium capitalize transition-all duration-200',
        sizeClasses[size],
        variantClasses[variant],
        colors.text,
        'hover:scale-105',
        className
      )}
    >
      {showIcon && (
        <span className="text-sm" role="img" aria-label={`${type} type`}>
          {emoji}
        </span>
      )}
      <span>{type}</span>
    </span>
  );
};

export default TypeBadge;