import { create } from 'zustand';
import { Pokemon } from '@/types/pokemon';
import { pokemonApi } from '@/api/pokemon';

interface PokemonStore {
  pokemon: Pokemon[];
  selectedPokemon: Pokemon | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPokemon: () => Promise<void>;
  createPokemon: (name: string, type: string) => Promise<void>;
  updatePokemon: (id: string, data: Partial<{ name: string; type: string }>) => Promise<void>;
  deletePokemon: (id: string) => Promise<void>;
  selectPokemon: (pokemon: Pokemon | null) => void;
  addExperience: (id: string, experience: number) => Promise<void>;
}

export const usePokemonStore = create<PokemonStore>((set, get) => ({
  pokemon: [],
  selectedPokemon: null,
  isLoading: false,
  error: null,

  fetchPokemon: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await pokemonApi.getAll();
      set({ pokemon: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch Pokemon', isLoading: false });
      console.error('Error fetching Pokemon:', error);
    }
  },

  createPokemon: async (name: string, type: string) => {
    set({ isLoading: true, error: null });
    try {
      const newPokemon = await pokemonApi.create({ name, type });
      set((state) => ({
        pokemon: [...state.pokemon, newPokemon],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create Pokemon', isLoading: false });
      console.error('Error creating Pokemon:', error);
    }
  },

  updatePokemon: async (id: string, data: Partial<{ name: string; type: string }>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPokemon = await pokemonApi.update(id, data);
      set((state) => ({
        pokemon: state.pokemon.map((p) => (p.id === id ? updatedPokemon : p)),
        selectedPokemon: state.selectedPokemon?.id === id ? updatedPokemon : state.selectedPokemon,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update Pokemon', isLoading: false });
      console.error('Error updating Pokemon:', error);
    }
  },

  deletePokemon: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await pokemonApi.delete(id);
      set((state) => ({
        pokemon: state.pokemon.filter((p) => p.id !== id),
        selectedPokemon: state.selectedPokemon?.id === id ? null : state.selectedPokemon,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete Pokemon', isLoading: false });
      console.error('Error deleting Pokemon:', error);
    }
  },

  selectPokemon: (pokemon: Pokemon | null) => {
    set({ selectedPokemon: pokemon });
  },

  addExperience: async (id: string, experience: number) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPokemon = await pokemonApi.addExperience(id, experience);
      set((state) => ({
        pokemon: state.pokemon.map((p) => (p.id === id ? updatedPokemon : p)),
        selectedPokemon: state.selectedPokemon?.id === id ? updatedPokemon : state.selectedPokemon,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add experience', isLoading: false });
      console.error('Error adding experience:', error);
    }
  },
}));