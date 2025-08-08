import { Pokemon, PokemonType } from '@/types/pokemon';
import Card from '@/components/common/Card';
import { Trash, PencilSimple } from '@phosphor-icons/react';
import { clsx } from 'clsx';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const typeColors: Record<PokemonType, string> = {
  normal: 'from-pokemon-normal to-pokemon-normal/70',
  fire: 'from-pokemon-fire to-pokemon-fire/70',
  water: 'from-pokemon-water to-pokemon-water/70',
  electric: 'from-pokemon-electric to-pokemon-electric/70',
  grass: 'from-pokemon-grass to-pokemon-grass/70',
  ice: 'from-pokemon-ice to-pokemon-ice/70',
  fighting: 'from-pokemon-fighting to-pokemon-fighting/70',
  poison: 'from-pokemon-poison to-pokemon-poison/70',
  ground: 'from-pokemon-ground to-pokemon-ground/70',
  flying: 'from-pokemon-flying to-pokemon-flying/70',
  psychic: 'from-pokemon-psychic to-pokemon-psychic/70',
  bug: 'from-pokemon-bug to-pokemon-bug/70',
  rock: 'from-pokemon-rock to-pokemon-rock/70',
  ghost: 'from-pokemon-ghost to-pokemon-ghost/70',
  dragon: 'from-pokemon-dragon to-pokemon-dragon/70',
  dark: 'from-pokemon-dark to-pokemon-dark/70',
  steel: 'from-pokemon-steel to-pokemon-steel/70',
  fairy: 'from-pokemon-fairy to-pokemon-fairy/70',
};

const PokemonCard = ({ pokemon, onClick, onEdit, onDelete }: PokemonCardProps) => {
  const progressPercentage = (pokemon.experience / 100) * 100;

  return (
    <Card hoverable className="relative overflow-hidden" onClick={onClick}>
      {/* Type gradient background */}
      <div
        className={clsx(
          'absolute inset-0 opacity-20 bg-gradient-to-br',
          typeColors[pokemon.type]
        )}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {pokemon.name}
            </h3>
            <span className="inline-block mt-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
              {pokemon.type}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <PencilSimple size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash size={20} className="text-red-500" />
              </button>
            )}
          </div>
        </div>

        {/* Level and evolution */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Level {pokemon.level}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              Stage {pokemon.evolution_stage}
            </span>
          </div>
          
          {/* Experience bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {pokemon.experience.toFixed(0)}/100 EXP
          </span>
        </div>

        {/* Pokemon sprite placeholder */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎮</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PokemonCard;