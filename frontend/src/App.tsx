import { BrowserRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Check, X, Robot } from '@phosphor-icons/react';
import { useState, useEffect, useRef } from 'react';
import { useAI } from './hooks/useAI';
import { useUIStore } from './stores/uiStore';
import { useKeyboardNavigation, useFocusTrap } from './hooks/useKeyboardNavigation';
import ThemeToggle from './components/common/ThemeToggle';

// Type definitions
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

interface Move {
  id: string;
  pokemon_id: string;
  name: string;
  description?: string;
  power: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// API functions
const pokemonApi = {
  getAll: async (): Promise<Pokemon[]> => {
    const response = await fetch('http://localhost:8000/api/v1/pokemon');
    if (!response.ok) throw new Error('Failed to fetch pokemon');
    return response.json();
  },

  create: async (data: { name: string; type: string }): Promise<Pokemon> => {
    const response = await fetch('http://localhost:8000/api/v1/pokemon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create pokemon');
    return response.json();
  },
};

const movesApi = {
  getByPokemon: async (pokemonId: string): Promise<Move[]> => {
    const response = await fetch(`http://localhost:8000/api/v1/moves/pokemon/${pokemonId}`);
    if (!response.ok) throw new Error('Failed to fetch moves');
    return response.json();
  },

  create: async (data: { pokemon_id: string; name: string; description?: string; power: number }): Promise<Move> => {
    const response = await fetch('http://localhost:8000/api/v1/moves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create move');
    return response.json();
  },

  complete: async (id: string): Promise<Move> => {
    const response = await fetch(`http://localhost:8000/api/v1/moves/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to complete move');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`http://localhost:8000/api/v1/moves/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete move');
  },
};

// Type emoji mapping
const getTypeEmoji = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    fire: '🔥',
    water: '💧',
    grass: '🌿',
    electric: '⚡',
    psychic: '🔮',
    ice: '❄️',
    dragon: '🐲',
    dark: '🌙',
    fairy: '✨',
    fighting: '👊',
    poison: '☠️',
    ground: '🌍',
    flying: '🪶',
    bug: '🐛',
    rock: '🗿',
    ghost: '👻',
    steel: '⚙️',
    normal: '⚪'
  };
  return typeMap[type] || '🎮';
};

function HomePage() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { isDarkMode } = useUIStore();
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for modal
  useKeyboardNavigation({
    onEscape: () => {
      if (showCreateForm) {
        setShowCreateForm(false);
      }
    },
    enabled: showCreateForm,
  });

  // Focus trap for modal
  useFocusTrap(modalRef, { enabled: showCreateForm });

  // Fetch Pokemon on component mount
  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await pokemonApi.getAll();
      setPokemon(data);
      // Fetched Pokemon successfully
    } catch (err) {
      setError('Failed to load Pokemon');
      console.error('Error fetching Pokemon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePokemon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    if (!name || !type) return;
    
    try {
      setError(null);
      const newPokemon = await pokemonApi.create({ name, type });
      setPokemon(prev => [...prev, newPokemon]);
      setShowCreateForm(false);
      // Reset form
      (event.target as HTMLFormElement).reset();
      // Pokemon created successfully
    } catch (err) {
      setError('Failed to create Pokemon');
      console.error('Error creating Pokemon:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <header className="mb-6 sm:mb-8" role="banner">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 font-pixel mb-2">Pokemon TODO</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your tasks with Pokemon!</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main role="main">
        {/* Error display */}
        {error && (
          <div 
            className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg" 
            role="alert"
            aria-live="polite"
          >
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12" aria-live="polite">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
              role="status"
              aria-label="Loading Pokemon"
            ></div>
            <span className="sr-only">Loading Pokemon...</span>
          </div>
        ) : pokemon.length === 0 ? (
          /* No Pokemon state */
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">No Pokemon yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first Pokemon to start managing tasks!
            </p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Pokemon
            </button>
          </div>
        ) : (
          /* Pokemon list */
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8"
            role="grid"
            aria-label="Pokemon collection"
          >
            {pokemon.map((p) => (
              <div key={p.id} className="card" role="gridcell" tabIndex={0}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{p.name}</h3>
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm capitalize text-gray-700 dark:text-gray-300">
                      {getTypeEmoji(p.type)} {p.type}
                    </span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl">{getTypeEmoji(p.type)}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Level {p.level}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Stage {p.evolution_stage}</span>
                  </div>
                  <div className="progress mb-1">
                    <div
                      className="progress-fill"
                      style={{ width: `${p.experience}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{p.experience.toFixed(0)}/100 EXP</span>
                    {p.experience >= 100 && <span className="text-xs text-green-500 font-semibold">MAX!</span>}
                  </div>
                </div>

                <Link 
                  to={`/pokemon/${p.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                  aria-label={`View details for ${p.name}, a ${p.type} type Pokemon at level ${p.level}`}
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Create Pokemon Modal */}
        {showCreateForm && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            role="dialog" 
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateForm(false);
              }
            }}
          >
            <div ref={modalRef} className="card w-full max-w-sm sm:max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 id="modal-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create New Pokemon</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePokemon} className="space-y-6">
                <div>
                  <label htmlFor="pokemon-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pokemon Name *
                  </label>
                  <input
                    type="text"
                    id="pokemon-name"
                    name="name"
                    required
                    className="input"
                    placeholder="e.g., Pikachu, Charizard"
                    aria-describedby="pokemon-name-help"
                  />
                  <div id="pokemon-name-help" className="sr-only">
                    Enter the name of your Pokemon
                  </div>
                </div>
                
                <div>
                  <label htmlFor="pokemon-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pokemon Type *
                  </label>
                  <select
                    id="pokemon-type"
                    name="type"
                    required
                    className="input"
                    aria-describedby="pokemon-type-help"
                  >
                    <option value="">Select a type...</option>
                    <option value="fire">🔥 Fire</option>
                    <option value="water">💧 Water</option>
                    <option value="grass">🌿 Grass</option>
                    <option value="electric">⚡ Electric</option>
                    <option value="psychic">🔮 Psychic</option>
                    <option value="ice">❄️ Ice</option>
                    <option value="dragon">🐲 Dragon</option>
                    <option value="dark">🌙 Dark</option>
                    <option value="fairy">✨ Fairy</option>
                    <option value="fighting">👊 Fighting</option>
                    <option value="poison">☠️ Poison</option>
                    <option value="ground">🌍 Ground</option>
                    <option value="flying">🪶 Flying</option>
                    <option value="bug">🐛 Bug</option>
                    <option value="rock">🗿 Rock</option>
                    <option value="ghost">👻 Ghost</option>
                    <option value="steel">⚙️ Steel</option>
                    <option value="normal">⚪ Normal</option>
                  </select>
                  <div id="pokemon-type-help" className="sr-only">
                    Choose the type that best represents your Pokemon
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Create Pokemon
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary flex-1 sm:flex-initial"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <button 
          onClick={() => setShowCreateForm(true)}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        >
          <Plus size={28} weight="bold" className="text-white sm:w-8 sm:h-8" />
        </button>
      </main>
    </div>
  );
}

function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // AI power calculation hook
  const { isCalculating, result: aiResult, error: aiError, suggestPower, reset: resetAI } = useAI();

  useEffect(() => {
    if (id) {
      fetchPokemonAndMoves(id);
    }
  }, [id]);

  const fetchPokemonAndMoves = async (pokemonId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch Pokemon details - we need to implement this API call
      const pokemonResponse = await fetch(`http://localhost:8000/api/v1/pokemon/${pokemonId}`);
      if (!pokemonResponse.ok) throw new Error('Failed to fetch pokemon');
      const pokemonData = await pokemonResponse.json();
      setPokemon(pokemonData);

      // Fetch moves for this Pokemon
      const movesData = await movesApi.getByPokemon(pokemonId);
      setMoves(movesData);
    } catch (err) {
      setError('Failed to load Pokemon details');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMove = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pokemon) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const power = parseInt(formData.get('power') as string, 10);

    if (!name || !power) return;

    try {
      const newMove = await movesApi.create({
        pokemon_id: pokemon.id,
        name,
        description: description || undefined,
        power,
      });
      setMoves(prev => [...prev, newMove]);
      setShowAddForm(false);
      resetAI();
      // Reset form
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setError('Failed to create move');
      console.error('Error creating move:', err);
    }
  };

  const handleSuggestPower = async () => {
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    const descInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    
    if (!nameInput?.value) {
      setError('Please enter a task name first');
      return;
    }

    await suggestPower(nameInput.value, descInput?.value);
  };

  const applyAISuggestion = () => {
    if (aiResult) {
      const powerInput = document.querySelector('input[name="power"]') as HTMLInputElement;
      if (powerInput) {
        powerInput.value = aiResult.power.toString();
      }
    }
  };

  const handleCompleteMove = async (moveId: string) => {
    try {
      const move = moves.find(m => m.id === moveId);
      if (!move) return;
      
      const completedMove = await movesApi.complete(moveId);
      setMoves(prev => prev.map(m => m.id === moveId ? completedMove : m));
      
      // Add experience to Pokemon when completing a task
      if (pokemon && !move.is_completed) {
        const experienceGain = Math.max(5, Math.floor(move.power / 10)); // 5-10 experience based on power
        
        // Call API to add experience
        try {
          const response = await fetch(`http://localhost:8000/api/v1/pokemon/${pokemon.id}/add-experience?experience=${experienceGain}`, {
            method: 'POST',
          });
          
          if (response.ok) {
            const updatedPokemon = await response.json();
            setPokemon(updatedPokemon);
            
            // Show success message with experience gained
            setError(null);
            setTimeout(() => {
              setError(`🎉 Task completed! +${experienceGain} EXP gained!`);
              setTimeout(() => setError(null), 3000);
            }, 500);
          }
        } catch (expError) {
          console.error('Error adding experience:', expError);
        }
      }
    } catch (err) {
      setError('Failed to complete move');
      console.error('Error completing move:', err);
    }
  };

  const handleDeleteMove = async (moveId: string) => {
    try {
      await movesApi.delete(moveId);
      setMoves(prev => prev.filter(m => m.id !== moveId));
    } catch (err) {
      setError('Failed to delete move');
      console.error('Error deleting move:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error || 'Pokemon not found'}</p>
        </div>
        <Link to="/" className="text-blue-500 hover:text-blue-700">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{pokemon.name}</h1>
              <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm capitalize text-gray-700 dark:text-gray-300">
                {getTypeEmoji(pokemon.type)} {pokemon.type}
              </span>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-3xl sm:text-4xl">{getTypeEmoji(pokemon.type)}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Level {pokemon.level}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Stage {pokemon.evolution_stage}</span>
            </div>
            <div className="progress mb-1">
              <div
                className="progress-fill"
                style={{ width: `${pokemon.experience}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">{pokemon.experience.toFixed(0)}/100 EXP</span>
              {pokemon.experience >= 100 && <span className="text-sm text-green-500 font-semibold">MAX!</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Moves Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Tasks (Moves)</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary w-full sm:w-auto"
          >
            Add Task
          </button>
        </div>

        {/* Add Move Form */}
        {showAddForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Add New Task</h3>
            <form onSubmit={handleAddMove} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input"
                  placeholder="e.g., Complete project documentation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  rows={3}
                  className="textarea"
                  placeholder="Additional details about the task..."
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority Level (1-100)</label>
                  <button
                    type="button"
                    onClick={handleSuggestPower}
                    disabled={isCalculating}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Robot size={16} />
                    <span>{isCalculating ? 'AI Thinking...' : 'AI Suggest'}</span>
                  </button>
                </div>
                <input
                  type="number"
                  name="power"
                  min="1"
                  max="100"
                  defaultValue="50"
                  required
                  className="input"
                />
              </div>

              {/* AI Suggestion Result */}
              {aiResult && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-semibold text-purple-800">
                      🤖 AI Suggestion {aiResult.ai_generated ? '(AI Generated)' : '(Fallback)'}
                    </h4>
                    <button
                      type="button"
                      onClick={applyAISuggestion}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-purple-700">Power:</span>{' '}
                      <span className="text-purple-900">{aiResult.power}</span>
                      <span className="text-purple-600 ml-2">({aiResult.estimated_time})</span>
                    </div>
                    <div>
                      <span className="font-medium text-purple-700">Reasoning:</span>{' '}
                      <span className="text-purple-800">{aiResult.reasoning}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Error */}
              {aiError && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>AI Note:</strong> {aiError} Using fallback calculation.
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Moves List */}
        {moves.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No tasks yet for {pokemon.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Add your first task to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {moves.map((move) => (
              <div
                key={move.id}
                className={`card transition-colors duration-200 ${
                  move.is_completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className={`text-base sm:text-lg font-semibold ${
                        move.is_completed ? 'line-through text-gray-500 dark:text-gray-600' : 'text-gray-800 dark:text-gray-100'
                      }`}>
                        {move.name}
                      </h3>
                      {move.is_completed && (
                        <Check size={20} className="ml-2 text-green-500" />
                      )}
                    </div>
                    {move.description && (
                      <p className={`text-sm mb-3 ${
                        move.is_completed ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {move.description}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Priority: {move.power}
                      </span>
                      {move.is_completed && move.completed_at && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Completed: {new Date(move.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    {!move.is_completed ? (
                      <button
                        onClick={() => handleCompleteMove(move.id)}
                        className="p-2 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                        title="Mark as completed"
                      >
                        <Check size={18} />
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleDeleteMove(move.id)}
                      className="p-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;