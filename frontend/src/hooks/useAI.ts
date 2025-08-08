import { useState, useCallback } from 'react';
import { aiApi } from '../api/ai';

interface PowerCalculationResult {
  power: number;
  difficulty_score: number;
  reasoning: string;
  estimated_time: string;
  ai_generated: boolean;
}

interface UseAIReturn {
  // State
  isCalculating: boolean;
  result: PowerCalculationResult | null;
  error: string | null;
  
  // Actions
  calculatePower: (name: string, description?: string, difficulty?: 'easy' | 'medium' | 'hard') => Promise<void>;
  suggestPower: (name: string, description?: string) => Promise<void>;
  reset: () => void;
}

export const useAI = (): UseAIReturn => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<PowerCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculatePower = useCallback(async (
    name: string, 
    description?: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      const response = await aiApi.calculatePower({
        move_name: name,
        move_description: description,
        difficulty_level: difficulty
      });
      
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate power');
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const suggestPower = useCallback(async (name: string, description?: string) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      const response = await aiApi.suggestPower(name, description);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suggest power');
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsCalculating(false);
  }, []);

  return {
    isCalculating,
    result,
    error,
    calculatePower,
    suggestPower,
    reset,
  };
};

// AI健康状態チェック用フック
interface UseAIHealthReturn {
  isChecking: boolean;
  health: {
    status: string;
    available_models?: string[];
    preferred_model_available?: boolean;
    error?: string;
  } | null;
  error: string | null;
  checkHealth: () => Promise<void>;
}

export const useAIHealth = (): UseAIHealthReturn => {
  const [isChecking, setIsChecking] = useState(false);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setIsChecking(true);
      setError(null);
      
      const response = await aiApi.checkHealth();
      setHealth(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check AI health');
      setHealth(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isChecking,
    health,
    error,
    checkHealth,
  };
};