import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import ProgressBar from '../common/ProgressBar';

interface LevelIndicatorProps {
  level: number;
  experience: number;
  maxExperience?: number;
  evolutionStage: number;
  maxEvolutionStage?: number;
  size?: 'sm' | 'md' | 'lg';
  showEvolution?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    container: 'p-3',
    level: 'text-lg font-bold',
    stage: 'text-xs',
    exp: 'text-xs',
    progress: 'h-1.5',
  },
  md: {
    container: 'p-4',
    level: 'text-xl font-bold',
    stage: 'text-sm',
    exp: 'text-sm',
    progress: 'h-2',
  },
  lg: {
    container: 'p-6',
    level: 'text-2xl font-bold',
    stage: 'text-base',
    exp: 'text-base',
    progress: 'h-3',
  },
};

const getEvolutionName = (stage: number): string => {
  const stages = ['Basic', 'Stage 1', 'Stage 2', 'Mega'];
  return stages[stage - 1] || 'Unknown';
};

const getEvolutionEmoji = (stage: number): string => {
  const emojis = ['🥚', '🐲', '🐉', '✨'];
  return emojis[stage - 1] || '🎮';
};

export const LevelIndicator: React.FC<LevelIndicatorProps> = ({
  level,
  experience,
  maxExperience = 100,
  evolutionStage,
  maxEvolutionStage = 3,
  size = 'md',
  showEvolution = true,
  animated = true,
  className
}) => {
  const experiencePercentage = Math.min((experience / maxExperience) * 100, 100);
  const isMaxLevel = experience >= maxExperience;
  const canEvolve = evolutionStage < maxEvolutionStage && isMaxLevel;
  
  const classes = sizeClasses[size];

  const LevelComponent = animated ? motion.div : 'div';
  const animationProps = animated
    ? {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <LevelComponent
      className={clsx(
        'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
        'border border-blue-200 dark:border-blue-700 rounded-xl',
        classes.container,
        className
      )}
      {...animationProps}
    >
      <div className="space-y-3">
        {/* Level Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400 text-2xl">
              ⭐
            </span>
            <div>
              <div className={clsx(classes.level, 'text-gray-800 dark:text-gray-100')}>
                Level {level}
              </div>
              {showEvolution && (
                <div className={clsx(classes.stage, 'text-gray-600 dark:text-gray-400')}>
                  {getEvolutionEmoji(evolutionStage)} {getEvolutionName(evolutionStage)}
                </div>
              )}
            </div>
          </div>
          
          {canEvolve && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full"
            >
              <span className="text-yellow-500">✨</span>
              <span className={clsx(classes.stage, 'text-yellow-700 dark:text-yellow-300')}>
                Can Evolve!
              </span>
            </motion.div>
          )}
        </div>

        {/* Experience Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={clsx(classes.exp, 'text-gray-600 dark:text-gray-400')}>
              Experience
            </span>
            <span className={clsx(classes.exp, 'text-gray-800 dark:text-gray-200 font-medium')}>
              {Math.round(experience)}/{maxExperience}
            </span>
          </div>
          
          <div className="relative">
            <ProgressBar
              value={experience}
              max={maxExperience}
              color={isMaxLevel ? 'green' : 'blue'}
              size={size}
              className="transition-all duration-300"
            />
            
            {animated && experiencePercentage > 0 && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                }}
              />
            )}
          </div>
          
          {isMaxLevel && (
            <div className={clsx(classes.exp, 'text-green-600 dark:text-green-400 font-medium text-center')}>
              🎉 Maximum Experience Reached!
            </div>
          )}
        </div>

        {/* Evolution Progress */}
        {showEvolution && maxEvolutionStage > 1 && (
          <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-700">
            <div className="flex justify-between items-center">
              <span className={clsx(classes.exp, 'text-gray-600 dark:text-gray-400')}>
                Evolution Stage
              </span>
              <span className={clsx(classes.exp, 'text-gray-800 dark:text-gray-200 font-medium')}>
                {evolutionStage}/{maxEvolutionStage}
              </span>
            </div>
            
            <ProgressBar
              value={evolutionStage}
              max={maxEvolutionStage}
              color="purple"
              size={size === 'lg' ? 'md' : 'sm'}
            />
          </div>
        )}
      </div>
    </LevelComponent>
  );
};

export default LevelIndicator;