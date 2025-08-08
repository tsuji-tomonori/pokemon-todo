// AI API client for Move power calculation
interface PowerCalculationRequest {
  move_name: string;
  move_description?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
}

interface PowerCalculationResponse {
  power: number;
  difficulty_score: number;
  reasoning: string;
  estimated_time: string;
  ai_generated: boolean;
}

interface AIHealthResponse {
  status: string;
  available_models?: string[];
  preferred_model_available?: boolean;
  error?: string;
}

export const aiApi = {
  // AI威力計算
  calculatePower: async (data: PowerCalculationRequest): Promise<PowerCalculationResponse> => {
    const response = await fetch('http://localhost:8000/api/v1/ai/calculate-power', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to calculate power');
    return response.json();
  },

  // 簡易威力提案
  suggestPower: async (moveName: string, moveDescription?: string): Promise<PowerCalculationResponse> => {
    const params = new URLSearchParams({
      move_name: moveName,
    });
    if (moveDescription) {
      params.append('move_description', moveDescription);
    }

    const response = await fetch(`http://localhost:8000/api/v1/ai/suggest-power?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to suggest power');
    return response.json();
  },

  // AI健康状態チェック
  checkHealth: async (): Promise<AIHealthResponse> => {
    const response = await fetch('http://localhost:8000/api/v1/ai/health');
    if (!response.ok) throw new Error('Failed to check AI health');
    return response.json();
  },
};