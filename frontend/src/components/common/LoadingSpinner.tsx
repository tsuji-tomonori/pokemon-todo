import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  type?: 'spinner' | 'dots' | 'pulse' | 'bounce';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  red: 'text-red-500',
  yellow: 'text-yellow-500',
  purple: 'text-purple-500',
  gray: 'text-gray-500',
};

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    className={clsx('border-2 border-current border-t-transparent rounded-full', className)}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
);

const DotsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('flex gap-1', className)}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-1.5 h-1.5 bg-current rounded-full"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

const PulseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    className={clsx('bg-current rounded-full', className)}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
    }}
  />
);

const BounceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('flex gap-1', className)}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-current rounded-full"
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.1,
        }}
      />
    ))}
  </div>
);

const loadingIcons = {
  spinner: SpinnerIcon,
  dots: DotsIcon,
  pulse: PulseIcon,
  bounce: BounceIcon,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  type = 'spinner',
  className,
  text,
}) => {
  const LoadingIcon = loadingIcons[type];

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-2', className)}>
      <div className={clsx(sizeClasses[size], colorClasses[color])}>
        <LoadingIcon className="w-full h-full" />
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  backdrop?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  backdrop = true,
  className,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={clsx(
        'absolute inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
        className
      )}
    >
      <LoadingSpinner text={text} size="lg" />
    </div>
  );
};

export default LoadingSpinner;