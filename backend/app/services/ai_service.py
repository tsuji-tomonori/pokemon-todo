from typing import Optional, Dict, Any
import httpx
import json
import logging
from tenacity import retry, stop_after_attempt, wait_exponential
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class AIService:
    """LM Studio連携サービス"""
    
    def __init__(self):
        self.base_url = settings.LM_STUDIO_URL
        self.timeout = 30.0
        
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def calculate_move_power(
        self, 
        move_name: str, 
        move_description: Optional[str] = None,
        difficulty_level: str = "medium"
    ) -> Dict[str, Any]:
        """
        AIを使用してMove（タスク）の威力を計算
        
        Args:
            move_name: タスク名
            move_description: タスクの詳細説明
            difficulty_level: 難易度レベル (easy, medium, hard)
            
        Returns:
            Dict with power (1-100), difficulty_score, reasoning
        """
        try:
            prompt = self._create_power_calculation_prompt(
                move_name, move_description, difficulty_level
            )
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/v1/chat/completions",
                    json={
                        "model": "google/gemma-3n-e4b",
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.3,
                        "max_tokens": 200
                    }
                )
                
                if response.status_code != 200:
                    raise httpx.HTTPError(f"LM Studio API error: {response.status_code}")
                
                result = response.json()
                ai_response = result["choices"][0]["message"]["content"]
                
                return self._parse_ai_response(ai_response, move_name)
                
        except httpx.TimeoutException:
            logger.error("AI service timeout")
            return self._fallback_power_calculation(move_name, move_description)
        except httpx.HTTPError as e:
            logger.error(f"AI service HTTP error: {e}")
            return self._fallback_power_calculation(move_name, move_description)
        except Exception as e:
            logger.error(f"AI service unexpected error: {e}")
            return self._fallback_power_calculation(move_name, move_description)
    
    def _create_power_calculation_prompt(
        self, 
        move_name: str, 
        move_description: Optional[str], 
        difficulty_level: str
    ) -> str:
        """タスク威力計算用のプロンプトを生成"""
        
        description_part = f"\nDescription: {move_description}" if move_description else ""
        
        return f"""You are a Pokemon-style TODO app assistant. Calculate the "power" of a task based on its complexity, time requirement, and difficulty.

Task: {move_name}{description_part}
Difficulty Level: {difficulty_level}

Please analyze this task and provide a power rating from 1-100 where:
- 1-20: Very simple tasks (< 30 minutes)
- 21-40: Simple tasks (30 minutes - 2 hours) 
- 41-60: Moderate tasks (2-6 hours)
- 61-80: Complex tasks (6+ hours or multiple days)
- 81-100: Very complex tasks (major projects, weeks/months)

Respond in this exact JSON format:
{{
  "power": [number between 1-100],
  "difficulty_score": [number between 1-10],
  "reasoning": "[brief explanation of the power rating]",
  "estimated_time": "[time estimate like '2 hours' or '3 days']"
}}"""

    def _parse_ai_response(self, ai_response: str, move_name: str) -> Dict[str, Any]:
        """AI応答をパースして構造化データに変換"""
        try:
            # JSON部分を抽出してパース
            if "{" in ai_response and "}" in ai_response:
                start = ai_response.find("{")
                end = ai_response.rfind("}") + 1
                json_str = ai_response[start:end]
                result = json.loads(json_str)
                
                # バリデーション
                power = max(1, min(100, int(result.get("power", 50))))
                difficulty_score = max(1, min(10, int(result.get("difficulty_score", 5))))
                
                return {
                    "power": power,
                    "difficulty_score": difficulty_score,
                    "reasoning": result.get("reasoning", "AI calculated power based on task complexity"),
                    "estimated_time": result.get("estimated_time", "Unknown"),
                    "ai_generated": True
                }
            else:
                raise ValueError("No JSON found in response")
                
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            logger.error(f"Failed to parse AI response: {e}")
            return self._fallback_power_calculation(move_name, None)
    
    def _fallback_power_calculation(
        self, 
        move_name: str, 
        move_description: Optional[str]
    ) -> Dict[str, Any]:
        """AI連携失敗時のフォールバック計算"""
        
        # シンプルなルールベース計算
        power = 50  # デフォルト
        
        # 名前の長さベース
        if len(move_name) > 30:
            power += 10
        elif len(move_name) < 10:
            power -= 10
            
        # キーワードベース推定
        complex_keywords = [
            "develop", "build", "create", "design", "implement", 
            "research", "analyze", "optimize", "refactor", "project"
        ]
        simple_keywords = [
            "fix", "update", "check", "review", "call", "email", "buy", "clean"
        ]
        
        text = f"{move_name} {move_description or ''}".lower()
        
        for keyword in complex_keywords:
            if keyword in text:
                power += 15
                break
                
        for keyword in simple_keywords:
            if keyword in text:
                power -= 15
                break
        
        power = max(1, min(100, power))
        
        return {
            "power": power,
            "difficulty_score": max(1, min(10, power // 10)),
            "reasoning": "Calculated using fallback rule-based system due to AI service unavailability",
            "estimated_time": self._estimate_time_from_power(power),
            "ai_generated": False
        }
    
    def _estimate_time_from_power(self, power: int) -> str:
        """威力値から推定時間を計算"""
        if power <= 20:
            return "< 30 minutes"
        elif power <= 40:
            return "30 minutes - 2 hours"
        elif power <= 60:
            return "2-6 hours"
        elif power <= 80:
            return "6+ hours"
        else:
            return "Multiple days"

    async def health_check(self) -> Dict[str, Any]:
        """LM Studio接続確認"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/v1/models")
                
                if response.status_code == 200:
                    models = response.json()
                    return {
                        "status": "healthy",
                        "available_models": [model["id"] for model in models.get("data", [])],
                        "preferred_model_available": any(
                            "gemma" in model["id"].lower() 
                            for model in models.get("data", [])
                        )
                    }
                else:
                    return {"status": "unhealthy", "error": f"Status {response.status_code}"}
                    
        except Exception as e:
            return {"status": "unreachable", "error": str(e)}


# シングルトンインスタンス
ai_service = AIService()