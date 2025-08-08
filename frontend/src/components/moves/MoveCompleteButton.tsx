import React, { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkle, Lightning, Sword } from '@phosphor-icons/react';

interface MoveCompleteButtonProps {
  isCompleted: boolean;
  power: number;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'battle' | 'minimal';
  showPowerGain?: boolean;
  expectedExperience?: number;
  onComplete: () => void;
  className?: string;
}

const sizeClasses = {
  sm: {
    button: 'px-3 py-2 text-sm',
    icon: 16,
    badge: 'text-xs px-2 py-1',
  },
  md: {
    button: 'px-4 py-3 text-base',
    icon: 20,
    badge: 'text-sm px-3 py-1',
  },
  lg: {
    button: 'px-6 py-4 text-lg',
    icon: 24,
    badge: 'text-base px-4 py-2',
  },
};

const getPowerIcon = (power: number) => {
  if (power <= 25) return Lightning;
  if (power <= 50) return Sword;
  if (power <= 75) return Sparkle;
  return Sparkle;
};

export const MoveCompleteButton: React.FC<MoveCompleteButtonProps> = ({
  isCompleted,
  power,
  disabled = false,
  loading = false,
  size = 'md',
  variant = 'default',
  showPowerGain = true,
  expectedExperience = 0,
  onComplete,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  
  const classes = sizeClasses[size];
  const PowerIcon = getPowerIcon(power);
  const calculatedExp = expectedExperience || Math.max(5, Math.floor(power / 10));

  const handleClick = async () => {
    if (disabled || loading || isCompleted) return;
    
    setJustCompleted(true);
    await onComplete();
    
    setTimeout(() => {
      setJustCompleted(false);
    }, 2000);
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || loading || isCompleted}
        className={clsx(
          'inline-flex items-center justify-center rounded-full transition-all duration-200',
          'hover:scale-110 active:scale-95',
          isCompleted
            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-default'
            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        style={{ width: '40px', height: '40px' }}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.3 }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            />
          ) : isCompleted ? (
            <motion.div
              key="completed"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 500 }}
            >
              <Check size={classes.icon} weight="bold" />
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <PowerIcon size={classes.icon} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  if (variant === 'battle') {
    return (
      <motion.button
        onClick={handleClick}
        disabled={disabled || loading || isCompleted}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={clsx(
          'relative overflow-hidden rounded-xl font-bold transition-all duration-300',
          'bg-gradient-to-r shadow-lg hover:shadow-xl',
          isCompleted
            ? 'from-green-500 to-green-600 text-white cursor-default'
            : 'from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
          disabled && 'opacity-50 cursor-not-allowed',
          classes.button,
          className
        )}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        {/* Background Animation */}
        <AnimatePresence>
          {(isHovered || justCompleted) && !isCompleted && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3 }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
            ) : isCompleted ? (
              <motion.div
                key="completed"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 500 }}
              >
                <Check size={classes.icon} weight="bold" />
              </motion.div>
            ) : (
              <motion.div
                key="battle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ rotate: 15 }}
              >
                <Sword size={classes.icon} weight="bold" />
              </motion.div>
            )}
          </AnimatePresence>
          
          <span>
            {loading ? 'Battling...' : isCompleted ? 'Victory!' : 'Battle!'}
          </span>
          
          {showPowerGain && !isCompleted && calculatedExp > 0 && (
            <motion.div
              className={clsx(
                'bg-white/20 rounded-full',
                classes.badge
              )}
              whileHover={{ scale: 1.05 }}
            >
              +{calculatedExp} EXP
            </motion.div>
          )}
        </div>
      </motion.button>
    );
  }

  // Default variant
  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading || isCompleted}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={clsx(
        'relative rounded-xl font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isCompleted
          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-700 cursor-default'
          : 'bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500 hover:border-blue-600 shadow-md hover:shadow-lg',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-blue-500 hover:border-blue-500',
        classes.button,
        className
      )}
      whileHover={{ scale: disabled || isCompleted ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isCompleted ? 1 : 0.98 }}
    >
      <div className="flex items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.3 }}
              className={clsx(
                'border-2 rounded-full animate-spin',
                isCompleted 
                  ? 'border-green-300 border-t-transparent' 
                  : 'border-white border-t-transparent',
                'w-4 h-4'
              )}
            />
          ) : isCompleted ? (
            <motion.div
              key="completed"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 500 }}
            >
              <Check size={classes.icon} weight="bold" />
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ rotate: 10 }}
            >
              <PowerIcon size={classes.icon} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <span>
          {loading ? 'Completing...' : isCompleted ? 'Completed' : 'Complete Move'}
        </span>
        
        {showPowerGain && !isCompleted && calculatedExp > 0 && (
          <motion.div
            className={clsx(
              'bg-white/20 rounded-full',
              classes.badge
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkle size={12} className="inline mr-1" />
            +{calculatedExp}
          </motion.div>
        )}
      </div>
      
      {/* Success animation overlay */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default MoveCompleteButton;