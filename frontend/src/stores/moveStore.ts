import { create } from 'zustand';
import { Move } from '../types/move';
import { movesApi } from '../api/moves';

interface MoveStore {
  moves: Move[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMovesByPokemon: (pokemonId: string) => Promise<void>;
  createMove: (pokemonId: string, name: string, description?: string, power?: number) => Promise<void>;
  updateMove: (id: string, data: Partial<{ name: string; description?: string; power: number }>) => Promise<void>;
  deleteMove: (id: string) => Promise<void>;
  completeMove: (id: string) => Promise<void>;
  clearMoves: () => void;
}

export const useMoveStore = create<MoveStore>((set, get) => ({
  moves: [],
  isLoading: false,
  error: null,

  fetchMovesByPokemon: async (pokemonId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await movesApi.getByPokemon(pokemonId);
      set({ moves: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch moves', isLoading: false });
      console.error('Error fetching moves:', error);
    }
  },

  createMove: async (pokemonId: string, name: string, description?: string, power: number = 50) => {
    set({ isLoading: true, error: null });
    try {
      const newMove = await movesApi.create({ pokemon_id: pokemonId, name, description, power });
      set((state) => ({
        moves: [...state.moves, newMove],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create move', isLoading: false });
      console.error('Error creating move:', error);
    }
  },

  updateMove: async (id: string, data: Partial<{ name: string; description?: string; power: number }>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMove = await movesApi.update(id, data);
      set((state) => ({
        moves: state.moves.map((m) => (m.id === id ? updatedMove : m)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update move', isLoading: false });
      console.error('Error updating move:', error);
    }
  },

  deleteMove: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await movesApi.delete(id);
      set((state) => ({
        moves: state.moves.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete move', isLoading: false });
      console.error('Error deleting move:', error);
    }
  },

  completeMove: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const completedMove = await movesApi.complete(id);
      set((state) => ({
        moves: state.moves.map((m) => (m.id === id ? completedMove : m)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to complete move', isLoading: false });
      console.error('Error completing move:', error);
    }
  },

  clearMoves: () => {
    set({ moves: [], error: null });
  },
}));