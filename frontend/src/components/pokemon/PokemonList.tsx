import { Pokemon } from '../../types/pokemon';
import PokemonCard from './PokemonCard';
import { motion } from 'framer-motion';

interface PokemonListProps {
  pokemon: Pokemon[];
  onPokemonClick?: (pokemon: Pokemon) => void;
  onEditPokemon?: (pokemon: Pokemon) => void;
  onDeletePokemon?: (pokemon: Pokemon) => void;
}

const PokemonList = ({ 
  pokemon, 
  onPokemonClick, 
  onEditPokemon, 
  onDeletePokemon 
}: PokemonListProps) => {
  if (pokemon.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Pokemon yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first Pokemon to start managing tasks!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pokemon.map((p, index) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PokemonCard
            pokemon={p}
            onClick={() => onPokemonClick?.(p)}
            onEdit={() => onEditPokemon?.(p)}
            onDelete={() => onDeletePokemon?.(p)}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default PokemonList;