import { apiClient } from './client';
import { Pokemon } from '@/types/pokemon';

export const pokemonApi = {
  // Get all Pokemon
  getAll: async (): Promise<Pokemon[]> => {
    const response = await apiClient.get('/pokemon');
    return response.data;
  },

  // Get single Pokemon
  getById: async (id: string): Promise<Pokemon> => {
    const response = await apiClient.get(`/pokemon/${id}`);
    return response.data;
  },

  // Create Pokemon
  create: async (data: { name: string; type: string }): Promise<Pokemon> => {
    const response = await apiClient.post('/pokemon', data);
    return response.data;
  },

  // Update Pokemon
  update: async (id: string, data: Partial<{ name: string; type: string }>): Promise<Pokemon> => {
    const response = await apiClient.put(`/pokemon/${id}`, data);
    return response.data;
  },

  // Delete Pokemon
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/pokemon/${id}`);
  },

  // Add experience
  addExperience: async (id: string, experience: number): Promise<Pokemon> => {
    const response = await apiClient.post(`/pokemon/${id}/add-experience`, null, {
      params: { experience }
    });
    return response.data;
  },
};