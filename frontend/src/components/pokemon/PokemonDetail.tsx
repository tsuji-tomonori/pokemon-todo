import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import TypeBadge from './TypeBadge';
import LevelIndicator from './LevelIndicator';

interface Pokemon {
  id: string;
  name: string;
  type: string;
  level: number;
  experience: number;
  evolution_stage: number;
  created_at: string;
  updated_at: string;
}

interface PokemonDetailProps {
  pokemon: Pokemon;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getPokemonEmoji = (type: string, stage: number): string => {
  const typeEmojis: Record<string, string[]> = {
    fire: ['🦎', '🐲', '🐉'],
    water: ['🐠', '🐡', '🐳'],
    grass: ['🌱', '🌿', '🌳'],
    electric: ['⚡', '🔋', '✨'],
    psychic: ['🔮', '🧠', '🌌'],
    ice: ['❄️', '🧊', '❆️'],
    dragon: ['🐲', '🐉', '👿'],
    normal: ['🐹', '🐈', '🐆'],
  };
  
  const emojis = typeEmojis[type.toLowerCase()] || ['🎮', '🎮', '🎮'];
  return emojis[Math.min(stage - 1, emojis.length - 1)] || emojis[0];
};

export const PokemonDetail: React.FC<PokemonDetailProps> = ({
  pokemon,
  showActions = false,
  onEdit,
  onDelete,
  className
}) => {
  const pokemonEmoji = getPokemonEmoji(pokemon.type, pokemon.evolution_stage);

  return (
    <Card className={clsx('relative overflow-hidden', className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-8 h-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-300 dark:border-gray-600"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <motion.h1
              className="text-3xl font-bold text-gray-800 dark:text-white mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {pokemon.name}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <TypeBadge type={pokemon.type} size="lg" />
            </motion.div>
          </div>

          {/* Pokemon Avatar */}
          <motion.div
            className="ml-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl" role="img" aria-label="Pokemon">
                {pokemonEmoji}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Level and Experience Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LevelIndicator
            level={pokemon.level}
            experience={pokemon.experience}
            evolutionStage={pokemon.evolution_stage}
            size="lg"
            animated
          />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Pokemon ID */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Pokemon ID
            </h3>
            <p className="text-lg font-mono text-gray-800 dark:text-gray-200 truncate">
              #{pokemon.id.slice(0, 8)}...
            </p>
          </div>

          {/* Evolution Stage */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Evolution Stage
            </h3>
            <p className="text-lg text-gray-800 dark:text-gray-200">
              Stage {pokemon.evolution_stage}
            </p>
          </div>

          {/* Created Date */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Created
            </h3>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {formatDate(pokemon.created_at)}
            </p>
          </div>

          {/* Last Updated */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Last Updated
            </h3>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {formatDate(pokemon.updated_at)}
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {showActions && (onEdit || onDelete) && (
          <motion.div
            className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Edit Pokemon
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Delete
              </button>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default PokemonDetail;