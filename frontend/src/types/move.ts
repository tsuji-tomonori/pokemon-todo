export interface Move {
  id: string;
  pokemon_id: string;
  name: string;
  description?: string;
  power: number; // 1-100
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}