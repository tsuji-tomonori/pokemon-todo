import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import ProgressBar from '../common/ProgressBar';

interface PowerGaugeProps {
  power: number;
  maxPower?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
  showNumericValue?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const getPowerLevel = (power: number, maxPower: number) => {
  const percentage = (power / maxPower) * 100;
  if (percentage <= 25) return { level: 'Low', color: 'red', emoji: '😴' };
  if (percentage <= 50) return { level: 'Medium', color: 'yellow', emoji: '😐' };
  if (percentage <= 75) return { level: 'High', color: 'blue', emoji: '😊' };
  return { level: 'Extreme', color: 'purple', emoji: '🤩' };
};

const sizeClasses = {
  sm: {
    container: 'p-2',
    label: 'text-xs',
    value: 'text-sm font-semibold',
    emoji: 'text-sm',
  },
  md: {
    container: 'p-3',
    label: 'text-sm',
    value: 'text-lg font-semibold',
    emoji: 'text-base',
  },
  lg: {
    container: 'p-4',
    label: 'text-base',
    value: 'text-xl font-bold',
    emoji: 'text-lg',
  },
};

export const PowerGauge: React.FC<PowerGaugeProps> = ({
  power,
  maxPower = 100,
  size = 'md',
  animated = true,
  showLabel = true,
  showNumericValue = true,
  variant = 'default',
  className
}) => {
  const powerInfo = getPowerLevel(power, maxPower);
  const percentage = Math.min((power / maxPower) * 100, 100);
  const classes = sizeClasses[size];
  
  const Container = animated ? motion.div : 'div';
  const animationProps = animated
    ? {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.3, delay: 0.1 },
      }
    : {};

  if (variant === 'compact') {
    return (
      <Container
        className={clsx(
          'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800',
          className
        )}
        {...animationProps}
      >
        {showLabel && (
          <span className={clsx(classes.emoji)}>
            {powerInfo.emoji}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <ProgressBar
            value={power}
            max={maxPower}
            color={powerInfo.color as 'blue' | 'green' | 'red' | 'yellow' | 'purple'}
            size="sm"
          />
        </div>
        {showNumericValue && (
          <span className={clsx(classes.value, 'text-gray-700 dark:text-gray-300')}>
            {power}
          </span>
        )}
      </Container>
    );
  }

  if (variant === 'detailed') {
    return (
      <Container
        className={clsx(
          'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
          'border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
          classes.container,
          className
        )}
        {...animationProps}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">⚡</span>
              <h3 className={clsx(classes.label, 'font-medium text-gray-700 dark:text-gray-300')}>
                Move Power
              </h3>
            </div>
            {showNumericValue && (
              <div className="text-right">
                <div className={clsx(classes.value, 'text-gray-900 dark:text-gray-100')}>
                  {power}
                </div>
                <div className={clsx(classes.label, 'text-gray-500 dark:text-gray-400')}>
                  / {maxPower}
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <ProgressBar
              value={power}
              max={maxPower}
              color={powerInfo.color as 'red' | 'yellow' | 'blue' | 'purple'}
              size={size}
              showValue={false}
            />
            
            {/* Power Level Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={classes.emoji}>{powerInfo.emoji}</span>
                <span className={clsx(classes.label, 'text-gray-600 dark:text-gray-400')}>
                  {powerInfo.level} Power
                </span>
              </div>
              <span className={clsx(classes.label, 'text-gray-500 dark:text-gray-400')}>
                {percentage.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Power Description */}
          <div className={clsx(
            'p-2 rounded-lg border-l-4',
            {
              'bg-red-50 dark:bg-red-900/20 border-red-400': powerInfo.color === 'red',
              'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400': powerInfo.color === 'yellow',
              'bg-blue-50 dark:bg-blue-900/20 border-blue-400': powerInfo.color === 'blue',
              'bg-purple-50 dark:bg-purple-900/20 border-purple-400': powerInfo.color === 'purple',
            }
          )}>
            <p className={clsx(classes.label, 'text-gray-700 dark:text-gray-300')}>
              {getPowerDescription(powerInfo.level)}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  // Default variant
  return (
    <Container
      className={clsx(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
        classes.container,
        className
      )}
      {...animationProps}
    >
      <div className="space-y-2">
        {showLabel && (
          <div className="flex items-center justify-between">
            <span className={clsx(classes.label, 'text-gray-600 dark:text-gray-400')}>
              Power Level
            </span>
            {showNumericValue && (
              <span className={clsx(classes.value, 'text-gray-900 dark:text-gray-100')}>
                {power}/{maxPower}
              </span>
            )}
          </div>
        )}
        
        <ProgressBar
          value={power}
          max={maxPower}
          color={powerInfo.color as 'blue' | 'green' | 'red' | 'yellow' | 'purple'}
          size={size}
          showValue={false}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={classes.emoji}>{powerInfo.emoji}</span>
            <span className={clsx(classes.label, 'text-gray-600 dark:text-gray-400')}>
              {powerInfo.level}
            </span>
          </div>
          <span className={clsx(classes.label, 'text-gray-500 dark:text-gray-400')}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </Container>
  );
};

const getPowerDescription = (level: string): string => {
  const descriptions = {
    Low: 'This move has minimal impact. Great for beginners or quick tasks.',
    Medium: 'A balanced move with moderate effectiveness for most situations.',
    High: 'A powerful move that delivers significant impact and results.',
    Extreme: 'An incredibly powerful move with maximum effectiveness!',
  };
  return descriptions[level as keyof typeof descriptions] || '';
};

export default PowerGauge;