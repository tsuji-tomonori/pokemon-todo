import React from 'react';
import { Sun, Moon } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { clsx } from 'clsx';

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const darkMode = isDarkMode();

  const toggleVariants = {
    light: { x: 0 },
    dark: { x: 24 },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -90 },
    visible: { opacity: 1, scale: 1, rotate: 0 },
  };

  return (
    <motion.button
      onClick={toggleDarkMode}
      className={clsx(
        'relative flex items-center w-12 h-6 rounded-full p-1 transition-colors duration-300',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        darkMode 
          ? 'bg-gray-700' 
          : 'bg-gray-200'
      )}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      {/* Toggle circle */}
      <motion.div
        className={clsx(
          'absolute w-4 h-4 rounded-full flex items-center justify-center',
          'shadow-lg transition-colors duration-300',
          darkMode
            ? 'bg-gray-800 text-yellow-400'
            : 'bg-white text-orange-500'
        )}
        variants={toggleVariants}
        animate={darkMode ? 'dark' : 'light'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <motion.div
          key={darkMode ? 'moon' : 'sun'}
          variants={iconVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.2 }}
        >
          {darkMode ? (
            <Moon size={12} weight="fill" />
          ) : (
            <Sun size={12} weight="fill" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;