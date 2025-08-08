import { useEffect, useState } from 'react';
import { Plus, CircleNotch } from '@phosphor-icons/react';
import { usePokemonStore } from '../stores/pokemonStore';
import PokemonList from '../components/pokemon/PokemonList';
import PokemonForm from '../components/pokemon/PokemonForm';
import Modal from '../components/common/Modal';
import { Pokemon, PokemonType } from '../types/pokemon';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  
  const { 
    pokemon, 
    isLoading, 
    error,
    fetchPokemon, 
    createPokemon, 
    updatePokemon,
    deletePokemon 
  } = usePokemonStore();

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  const handleCreatePokemon = async (name: string, type: PokemonType) => {
    await createPokemon(name, type);
    setIsCreateModalOpen(false);
  };

  const handleEditPokemon = async (name: string, type: PokemonType) => {
    if (selectedPokemon) {
      await updatePokemon(selectedPokemon.id, { name, type });
      setIsEditModalOpen(false);
      setSelectedPokemon(null);
    }
  };

  const handleDeletePokemon = async () => {
    if (selectedPokemon) {
      await deletePokemon(selectedPokemon.id);
      setIsDeleteModalOpen(false);
      setSelectedPokemon(null);
    }
  };

  const openEditModal = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setIsDeleteModalOpen(true);
  };

  const handlePokemonClick = (pokemon: Pokemon) => {
    navigate(`/pokemon/${pokemon.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white font-pixel">
          Pokemon TODO
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your tasks with Pokemon!
        </p>
      </header>

      <main>
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircleNotch size={48} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <PokemonList
            pokemon={pokemon}
            onPokemonClick={handlePokemonClick}
            onEditPokemon={openEditModal}
            onDeletePokemon={openDeleteModal}
          />
        )}

        {/* Floating Action Button */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-110 flex items-center justify-center"
        >
          <Plus size={32} weight="bold" className="text-white" />
        </button>
      </main>

      {/* Create Pokemon Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Pokemon"
      >
        <PokemonForm
          onSubmit={handleCreatePokemon}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Pokemon Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPokemon(null);
        }}
        title="Edit Pokemon"
      >
        {selectedPokemon && (
          <PokemonForm
            initialData={{
              name: selectedPokemon.name,
              type: selectedPokemon.type as PokemonType
            }}
            onSubmit={handleEditPokemon}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedPokemon(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPokemon(null);
        }}
        title="Delete Pokemon"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <strong>{selectedPokemon?.name}</strong>? 
            This action cannot be undone and will also delete all associated moves.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDeletePokemon}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedPokemon(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;