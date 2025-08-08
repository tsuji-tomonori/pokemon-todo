import { apiClient } from './client';
import { Move } from '../types/move';

export const movesApi = {
  // Create move
  create: async (data: { pokemon_id: string; name: string; description?: string; power: number }): Promise<Move> => {
    const response = await apiClient.post('/moves', data);
    return response.data;
  },

  // Get moves by pokemon
  getByPokemon: async (pokemonId: string): Promise<Move[]> => {
    const response = await apiClient.get(`/moves/pokemon/${pokemonId}`);
    return response.data;
  },

  // Get single move
  getById: async (id: string): Promise<Move> => {
    const response = await apiClient.get(`/moves/${id}`);
    return response.data;
  },

  // Update move
  update: async (id: string, data: Partial<{ name: string; description?: string; power: number }>): Promise<Move> => {
    const response = await apiClient.put(`/moves/${id}`, data);
    return response.data;
  },

  // Delete move
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/moves/${id}`);
  },

  // Complete move (mark as done)
  complete: async (id: string): Promise<Move> => {
    const response = await apiClient.post(`/moves/${id}/complete`);
    return response.data;
  },

  // Get completed moves for a pokemon
  getCompleted: async (pokemonId: string): Promise<Move[]> => {
    const response = await apiClient.get(`/moves/pokemon/${pokemonId}/completed`);
    return response.data;
  },

  // Get pending moves for a pokemon
  getPending: async (pokemonId: string): Promise<Move[]> => {
    const response = await apiClient.get(`/moves/pokemon/${pokemonId}/pending`);
    return response.data;
  },
};