export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface Pokemon {
  id: string;
  name: string;
  type: PokemonType;
  level: number;
  experience: number;
  evolution_stage: number;
  created_at: string;
  updated_at: string;
}