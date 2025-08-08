import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Move } from '../types/move';
import { movesApi } from '../api/moves';
import { useUIStore } from './uiStore';
import { usePokemonStore } from './pokemonStore';

interface MoveStore {
  // State
  moves: Map<string, Move[]>; // pokemonId -> moves
  isLoading: boolean;
  error: string | null;
  lastFetch: Map<string, number>; // pokemonId -> timestamp

  // Actions
  fetchMovesByPokemon: (pokemonId: string, force?: boolean) => Promise<void>;
  createMove: (pokemonId: string, name: string, description?: string, power?: number) => Promise<Move | null>;
  updateMove: (id: string, data: Partial<{ name: string; description?: string; power: number }>) => Promise<void>;
  deleteMove: (id: string) => Promise<void>;
  completeMove: (id: string) => Promise<void>;
  clearMoves: (pokemonId?: string) => void;
  clearError: () => void;
  
  // Selectors
  getMovesByPokemon: (pokemonId: string) => Move[];
  getCompletedMoves: (pokemonId: string) => Move[];
  getPendingMoves: (pokemonId: string) => Move[];
  getTotalMoves: (pokemonId: string) => number;
  getCompletionRate: (pokemonId: string) => number;
}

// Cache duration: 3 minutes
const CACHE_DURATION = 3 * 60 * 1000;

export const useMoveStore = create<MoveStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        moves: new Map(),
        isLoading: false,
        error: null,
        lastFetch: new Map(),

        // Fetch with cache
        fetchMovesByPokemon: async (pokemonId: string, force = false) => {
          const now = Date.now();
          const lastFetchTime = get().lastFetch.get(pokemonId);
          
          // Check cache validity
          if (!force && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
            return; // Use cached data
          }

          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const data = await movesApi.getByPokemon(pokemonId);
            set((state) => {
              state.moves.set(pokemonId, data);
              state.lastFetch.set(pokemonId, now);
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = 'Failed to fetch moves';
              state.isLoading = false;
            });
            console.error('Error fetching moves:', error);
          }
        },

        // Create with optimistic update
        createMove: async (pokemonId: string, name: string, description?: string, power: number = 50) => {
          const tempId = `temp-${Date.now()}`;
          const optimisticMove: Move = {
            id: tempId,
            pokemon_id: pokemonId,
            name,
            description,
            power,
            is_completed: false,
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Optimistic update
          set((state) => {
            const pokemonMoves = state.moves.get(pokemonId) || [];
            state.moves.set(pokemonId, [...pokemonMoves, optimisticMove]);
            state.isLoading = true;
            state.error = null;
          });

          try {
            const newMove = await movesApi.create({ 
              pokemon_id: pokemonId, 
              name, 
              description, 
              power 
            });
            
            set((state) => {
              // Replace optimistic with real
              const pokemonMoves = state.moves.get(pokemonId) || [];
              const index = pokemonMoves.findIndex(m => m.id === tempId);
              if (index !== -1) {
                pokemonMoves[index] = newMove;
                state.moves.set(pokemonId, [...pokemonMoves]);
              }
              state.isLoading = false;
            });
            
            // Show success toast
            useUIStore.getState().showToast('success', 'Task created successfully!');
            
            // Add experience to Pokemon for creating a task
            usePokemonStore.getState().addExperience(pokemonId, 5);
            
            return newMove;
          } catch (error) {
            // Rollback
            set((state) => {
              const pokemonMoves = state.moves.get(pokemonId) || [];
              state.moves.set(pokemonId, pokemonMoves.filter(m => m.id !== tempId));
              state.error = 'Failed to create move';
              state.isLoading = false;
            });
            
            useUIStore.getState().showToast('error', 'Failed to create task');
            console.error('Error creating move:', error);
            return null;
          }
        },

        // Update with optimistic update
        updateMove: async (id: string, data: Partial<{ name: string; description?: string; power: number }>) => {
          // Find the move and its Pokemon
          let pokemonId: string | null = null;
          let originalMove: Move | null = null;
          
          for (const [pid, moves] of get().moves.entries()) {
            const move = moves.find(m => m.id === id);
            if (move) {
              pokemonId = pid;
              originalMove = { ...move };
              break;
            }
          }
          
          if (!pokemonId || !originalMove) return;

          // Optimistic update
          set((state) => {
            const pokemonMoves = state.moves.get(pokemonId!) || [];
            const index = pokemonMoves.findIndex(m => m.id === id);
            if (index !== -1) {
              Object.assign(pokemonMoves[index], data);
              state.moves.set(pokemonId!, [...pokemonMoves]);
            }
            state.isLoading = true;
            state.error = null;
          });

          try {
            const updatedMove = await movesApi.update(id, data);
            
            set((state) => {
              const pokemonMoves = state.moves.get(pokemonId!) || [];
              const index = pokemonMoves.findIndex(m => m.id === id);
              if (index !== -1) {
                pokemonMoves[index] = updatedMove;
                state.moves.set(pokemonId!, [...pokemonMoves]);
              }
              state.isLoading = false;
            });
            
            useUIStore.getState().showToast('success', 'Task updated successfully!');
          } catch (error) {
            // Rollback
            set((state) => {
              const pokemonMoves = state.moves.get(pokemonId!) || [];
              const index = pokemonMoves.findIndex(m => m.id === id);
              if (index !== -1) {
                pokemonMoves[index] = originalMove!;
                state.moves.set(pokemonId!, [...pokemonMoves]);
              }
              state.error = 'Failed to update move';
              state.isLoading = false;
            });
            
            useUIStore.getState().showToast('error', 'Failed to update task');
            console.error('Error updating move:', error);
          }
        },

        // Delete with optimistic update
        deleteMove: async (id: string) => {
          // Find the move and its Pokemon
          let pokemonId: string | null = null;
          let originalMove: Move | null = null;
          
          for (const [pid, moves] of get().moves.entries()) {
            const move = moves.find(m => m.id === id);
            if (move) {
              pokemonId = pid;
              originalMove = { ...move };
              break;
            }
          }
          
          if (!pokemonId || !originalMove) return;

          // Optimistic delete
          set((state) => {
            const pokemonMoves = state.moves.get(pokemonId!) || [];
            state.moves.set(pokemonId!, pokemonMoves.filter(m => m.id !== id));
            state.isLoading = true;
            state.error = null;
          });

          try {
            await movesApi.delete(id);
            
            set((state) => {
              state.isLoading = false;
            });
            
            useUIStore.getState().showToast('success', 'Task deleted successfully!');
          } catch (error) {
            // Rollback
            set((state) => {
              const pokemonMoves = state.moves.get(pokemonId!) || [];
              pokemonMoves.push(originalMove!);
              state.moves.set(pokemonId!, pokemonMoves);
              state.error = 'Failed to delete move';
              state.isLoading = false;
            });
            
            useUIStore.getState().showToast('error', 'Failed to delete task');
            console.error('Error deleting move:', error);
          }
        },

        // Complete move with optimistic update
        completeMove: async (id: string) => {
          // Find the move and its Pokemon
          let pokemonId: string | null = null;
          let originalMove: Move | null = null;
          
          for (const [pid, moves] of get().moves.entries()) {
            const move = moves.find(m => m.id === id);
            if (move) {
              pokemonId = pid;
              originalMove = { ...move };
              break;
            }
          }
          
          if (!pokemonId || !originalMove || originalMove.is_completed) return;

          // Optimistic update
          set((state) => {
            const pokemonMoves = state.moves.get(pokemonId!) || [];
            const index = pokemonMoves.findIndex(m => m.id === id);
            if (index !== -1) {
              pokemonMoves[index].is_completed = true;
              pokemonMoves[index].completed_at = new Date().toISOString();
              state.moves.set(pokemonId!, [...pokemonMoves]);
            }
            state.isLoading = true;
            state.error = null;
          });

          try {
            const completedMove = await movesApi.complete(id);
            
            set((state) => {
              const pokemonMoves = state.moves.get(pokemonId!) || [];
              const index = pokemonMoves.findIndex(m => m.id === id);
              if (index !== -1) {
                pokemonMoves[index] = completedMove;
                state.moves.set(pokemonId!, [...pokemonMoves]);
              }
              state.isLoading = false;
            });
            
            useUIStore.getState().showToast('success', '🎉 Task completed!');
            
            // Add experience for completing a task
            const experienceGain = originalMove.power / 10; // 1-10 experience based on power
            usePokemonStore.getState().addExperience(pokemonId, experienceGain);
          } catch (error) {
            // Rollback
            set((state) => {
              const pokemonMoves = state.moves.get(pokemonId!) || [];
              const index = pokemonMoves.findIndex(m => m.id === id);
              if (index !== -1) {
                pokemonMoves[index] = originalMove!;
                state.moves.set(pokemonId!, [...pokemonMoves]);
              }
              state.error = 'Failed to complete move';
              state.isLoading = false;
            });
            
            useUIStore.getState().showToast('error', 'Failed to complete task');
            console.error('Error completing move:', error);
          }
        },

        clearMoves: (pokemonId?: string) => {
          set((state) => {
            if (pokemonId) {
              state.moves.delete(pokemonId);
              state.lastFetch.delete(pokemonId);
            } else {
              state.moves.clear();
              state.lastFetch.clear();
            }
            state.error = null;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Selectors
        getMovesByPokemon: (pokemonId: string) => {
          return get().moves.get(pokemonId) || [];
        },

        getCompletedMoves: (pokemonId: string) => {
          const moves = get().moves.get(pokemonId) || [];
          return moves.filter(m => m.is_completed);
        },

        getPendingMoves: (pokemonId: string) => {
          const moves = get().moves.get(pokemonId) || [];
          return moves.filter(m => !m.is_completed);
        },

        getTotalMoves: (pokemonId: string) => {
          const moves = get().moves.get(pokemonId) || [];
          return moves.length;
        },

        getCompletionRate: (pokemonId: string) => {
          const moves = get().moves.get(pokemonId) || [];
          if (moves.length === 0) return 0;
          const completed = moves.filter(m => m.is_completed).length;
          return Math.round((completed / moves.length) * 100);
        },
      })),
      {
        name: 'move-storage',
        partialize: (state) => ({
          moves: Array.from(state.moves.entries()),
          lastFetch: Array.from(state.lastFetch.entries()),
        }),
        // Custom merge function to handle Map deserialization
        merge: (persistedState: any, currentState: any) => {
          const moves = new Map(persistedState?.moves || []);
          const lastFetch = new Map(persistedState?.lastFetch || []);
          return {
            ...currentState,
            moves,
            lastFetch,
          };
        },
      }
    ),
    { name: 'MoveStore' }
  )
);