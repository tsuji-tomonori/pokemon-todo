import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, CircleNotch } from '@phosphor-icons/react';
import { usePokemonStore } from '../stores/pokemonStore';
import { useMoveStore } from '../stores/moveStore';
import { Move } from '../types/move';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import MoveList from '../components/moves/MoveList';
import MoveForm from '../components/moves/MoveForm';
import ProgressBar from '../components/common/ProgressBar';

const PokemonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);

  const { pokemon, fetchPokemon } = usePokemonStore();
  const { 
    moves, 
    isLoading, 
    error,
    fetchMovesByPokemon, 
    createMove, 
    updateMove,
    deleteMove,
    completeMove,
    clearMoves
  } = useMoveStore();

  const currentPokemon = pokemon.find(p => p.id === id);

  useEffect(() => {
    if (id) {
      fetchMovesByPokemon(id);
    }
    return () => clearMoves();
  }, [id, fetchMovesByPokemon, clearMoves]);

  useEffect(() => {
    if (pokemon.length === 0) {
      fetchPokemon();
    }
  }, [pokemon.length, fetchPokemon]);

  const handleCreateMove = async (name: string, description: string, power: number) => {
    if (id) {
      await createMove(id, name, description, power);
      setIsCreateModalOpen(false);
    }
  };

  const handleEditMove = async (name: string, description: string, power: number) => {
    if (selectedMove) {
      await updateMove(selectedMove.id, { name, description, power });
      setIsEditModalOpen(false);
      setSelectedMove(null);
    }
  };

  const handleDeleteMove = async () => {
    if (selectedMove) {
      await deleteMove(selectedMove.id);
      setIsDeleteModalOpen(false);
      setSelectedMove(null);
    }
  };

  const handleCompleteMove = async (move: Move) => {
    if (!move.is_completed) {
      await completeMove(move.id);
    }
  };

  const openEditModal = (move: Move) => {
    setSelectedMove(move);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (move: Move) => {
    setSelectedMove(move);
    setIsDeleteModalOpen(true);
  };

  if (!currentPokemon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Pokemon
        </Button>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Pokemon not found</p>
          </div>
        </Card>
      </div>
    );
  }

  const completedMovesCount = moves.filter(m => m.is_completed).length;
  const totalMoves = moves.length;
  const progressPercentage = totalMoves > 0 ? (completedMovesCount / totalMoves) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Pokemon
      </Button>

      {/* Pokemon Info Header */}
      <Card className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {currentPokemon.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                {currentPokemon.type}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Level {currentPokemon.level}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Stage {currentPokemon.evolution_stage}
              </span>
            </div>
          </div>
          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        </div>

        {/* Experience Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Experience
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {currentPokemon.experience.toFixed(0)}/100 EXP
            </span>
          </div>
          <ProgressBar 
            value={currentPokemon.experience} 
            max={100} 
            color="blue"
          />
        </div>

        {/* Tasks Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tasks Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              {completedMovesCount}/{totalMoves} completed
            </span>
          </div>
          <ProgressBar 
            value={progressPercentage} 
            max={100} 
            color="green"
          />
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Moves Section */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Moves & Tasks
          </h2>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="sm"
          >
            <Plus size={20} className="mr-2" />
            Add Move
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <CircleNotch size={32} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <MoveList
            moves={moves}
            onCompleteMove={handleCompleteMove}
            onEditMove={openEditModal}
            onDeleteMove={openDeleteModal}
          />
        )}
      </Card>

      {/* Create Move Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Move"
      >
        <MoveForm
          onSubmit={handleCreateMove}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Move Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMove(null);
        }}
        title="Edit Move"
      >
        {selectedMove && (
          <MoveForm
            initialData={{
              name: selectedMove.name,
              description: selectedMove.description || '',
              power: selectedMove.power
            }}
            onSubmit={handleEditMove}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedMove(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMove(null);
        }}
        title="Delete Move"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <strong>{selectedMove?.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteMove}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedMove(null);
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

export default PokemonDetailPage;