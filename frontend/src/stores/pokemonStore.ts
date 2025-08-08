import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Pokemon } from '../types/pokemon';
import { pokemonApi } from '../api/pokemon';

interface PokemonStore {
  // State
  pokemon: Pokemon[];
  selectedPokemon: Pokemon | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Actions
  fetchPokemon: (force?: boolean) => Promise<void>;
  createPokemon: (name: string, type: string) => Promise<Pokemon | null>;
  updatePokemon: (id: string, data: Partial<{ name: string; type: string }>) => Promise<void>;
  deletePokemon: (id: string) => Promise<void>;
  selectPokemon: (pokemon: Pokemon | null) => void;
  addExperience: (id: string, experience: number) => Promise<void>;
  clearError: () => void;
  
  // Selectors
  getPokemonById: (id: string) => Pokemon | undefined;
  getPokemonByType: (type: string) => Pokemon[];
  getTotalPokemon: () => number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const usePokemonStore = create<PokemonStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        pokemon: [],
        selectedPokemon: null,
        isLoading: false,
        error: null,
        lastFetch: null,

        // Fetch with cache
        fetchPokemon: async (force = false) => {
          const state = get();
          const now = Date.now();
          
          // Check cache validity
          if (!force && state.lastFetch && now - state.lastFetch < CACHE_DURATION) {
            return; // Use cached data
          }

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const data = await pokemonApi.getAll();
            set((state) => {
              state.pokemon = data;
              state.isLoading = false;
              state.lastFetch = now;
            });
          } catch (error) {
            set((state) => {
              state.error = 'Failed to fetch Pokemon';
              state.isLoading = false;
            });
            console.error('Error fetching Pokemon:', error);
          }
        },

        // Create with optimistic update
        createPokemon: async (name: string, type: string) => {
          // Optimistic update
          const tempId = `temp-${Date.now()}`;
          const optimisticPokemon: Pokemon = {
            id: tempId,
            name,
            type,
            level: 1,
            experience: 0,
            evolution_stage: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          set((state) => {
            state.pokemon.push(optimisticPokemon);
            state.isLoading = true;
            state.error = null;
          });

          try {
            const newPokemon = await pokemonApi.create({ name, type });
            
            set((state) => {
              // Replace optimistic with real
              const index = state.pokemon.findIndex(p => p.id === tempId);
              if (index !== -1) {
                state.pokemon[index] = newPokemon;
              }
              state.isLoading = false;
            });
            
            return newPokemon;
          } catch (error) {
            // Rollback optimistic update
            set((state) => {
              state.pokemon = state.pokemon.filter(p => p.id !== tempId);
              state.error = 'Failed to create Pokemon';
              state.isLoading = false;
            });
            console.error('Error creating Pokemon:', error);
            return null;
          }
        },

        // Update with optimistic update
        updatePokemon: async (id: string, data: Partial<{ name: string; type: string }>) => {
          const originalPokemon = get().pokemon.find(p => p.id === id);
          if (!originalPokemon) return;

          // Optimistic update
          set((state) => {
            const pokemon = state.pokemon.find(p => p.id === id);
            if (pokemon) {
              Object.assign(pokemon, data);
            }
            if (state.selectedPokemon?.id === id) {
              Object.assign(state.selectedPokemon, data);
            }
            state.isLoading = true;
            state.error = null;
          });

          try {
            const updatedPokemon = await pokemonApi.update(id, data);
            
            set((state) => {
              const index = state.pokemon.findIndex(p => p.id === id);
              if (index !== -1) {
                state.pokemon[index] = updatedPokemon;
              }
              if (state.selectedPokemon?.id === id) {
                state.selectedPokemon = updatedPokemon;
              }
              state.isLoading = false;
            });
          } catch (error) {
            // Rollback
            set((state) => {
              const index = state.pokemon.findIndex(p => p.id === id);
              if (index !== -1) {
                state.pokemon[index] = originalPokemon;
              }
              if (state.selectedPokemon?.id === id) {
                state.selectedPokemon = originalPokemon;
              }
              state.error = 'Failed to update Pokemon';
              state.isLoading = false;
            });
            console.error('Error updating Pokemon:', error);
          }
        },

        // Delete with optimistic update
        deletePokemon: async (id: string) => {
          const originalPokemon = get().pokemon.find(p => p.id === id);
          if (!originalPokemon) return;

          // Optimistic delete
          set((state) => {
            state.pokemon = state.pokemon.filter(p => p.id !== id);
            if (state.selectedPokemon?.id === id) {
              state.selectedPokemon = null;
            }
            state.isLoading = true;
            state.error = null;
          });

          try {
            await pokemonApi.delete(id);
            set((state) => {
              state.isLoading = false;
            });
          } catch (error) {
            // Rollback
            set((state) => {
              state.pokemon.push(originalPokemon);
              state.error = 'Failed to delete Pokemon';
              state.isLoading = false;
            });
            console.error('Error deleting Pokemon:', error);
          }
        },

        selectPokemon: (pokemon: Pokemon | null) => {
          set((state) => {
            state.selectedPokemon = pokemon;
          });
        },

        addExperience: async (id: string, experience: number) => {
          const originalPokemon = get().pokemon.find(p => p.id === id);
          if (!originalPokemon) return;

          // Optimistic update
          set((state) => {
            const pokemon = state.pokemon.find(p => p.id === id);
            if (pokemon) {
              pokemon.experience = Math.min(100, pokemon.experience + experience);
              // Level up logic
              if (pokemon.experience >= 100) {
                pokemon.level += 1;
                pokemon.experience = 0;
                if (pokemon.level % 10 === 0) {
                  pokemon.evolution_stage = Math.min(3, pokemon.evolution_stage + 1);
                }
              }
            }
            state.isLoading = true;
          });

          try {
            const updatedPokemon = await pokemonApi.addExperience(id, experience);
            
            set((state) => {
              const index = state.pokemon.findIndex(p => p.id === id);
              if (index !== -1) {
                state.pokemon[index] = updatedPokemon;
              }
              if (state.selectedPokemon?.id === id) {
                state.selectedPokemon = updatedPokemon;
              }
              state.isLoading = false;
            });
          } catch (error) {
            // Rollback
            set((state) => {
              const index = state.pokemon.findIndex(p => p.id === id);
              if (index !== -1) {
                state.pokemon[index] = originalPokemon;
              }
              if (state.selectedPokemon?.id === id) {
                state.selectedPokemon = originalPokemon;
              }
              state.error = 'Failed to add experience';
              state.isLoading = false;
            });
            console.error('Error adding experience:', error);
          }
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Selectors
        getPokemonById: (id: string) => {
          return get().pokemon.find(p => p.id === id);
        },

        getPokemonByType: (type: string) => {
          return get().pokemon.filter(p => p.type === type);
        },

        getTotalPokemon: () => {
          return get().pokemon.length;
        },
      })),
      {
        name: 'pokemon-storage',
        partialize: (state) => ({
          pokemon: state.pokemon,
          selectedPokemon: state.selectedPokemon,
          lastFetch: state.lastFetch,
        }),
      }
    ),
    { name: 'PokemonStore' }
  )
);