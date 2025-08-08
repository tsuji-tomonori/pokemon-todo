from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from app.services.ai_service import ai_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class PowerCalculationRequest(BaseModel):
    """Move威力計算リクエスト"""
    move_name: str = Field(..., min_length=1, max_length=100, description="Move/Task name")
    move_description: Optional[str] = Field(None, max_length=500, description="Optional detailed description")
    difficulty_level: str = Field(default="medium", pattern="^(easy|medium|hard)$", description="Difficulty hint")

class PowerCalculationResponse(BaseModel):
    """Move威力計算レスポンス"""
    power: int = Field(..., ge=1, le=100, description="Calculated power level")
    difficulty_score: int = Field(..., ge=1, le=10, description="Difficulty rating")
    reasoning: str = Field(..., description="AI reasoning for the power calculation")
    estimated_time: str = Field(..., description="Estimated time to complete")
    ai_generated: bool = Field(..., description="Whether result was AI-generated or fallback")

class AIHealthResponse(BaseModel):
    """AI服务健康状态响应"""
    status: str = Field(..., description="Service status")
    available_models: Optional[list] = Field(None, description="Available LM Studio models")
    preferred_model_available: Optional[bool] = Field(None, description="Whether preferred model is available")
    error: Optional[str] = Field(None, description="Error message if unhealthy")

@router.post("/calculate-power", response_model=PowerCalculationResponse, status_code=status.HTTP_200_OK)
async def calculate_move_power(request: PowerCalculationRequest) -> PowerCalculationResponse:
    """
    AIを使用してMove（タスク）の威力を自動計算
    
    タスクの名前と説明を元に、1-100の威力値を計算します。
    LM Studioが利用できない場合は、ルールベースのフォールバック計算を使用します。
    """
    try:
        logger.info(f"Calculating power for move: {request.move_name}")
        
        result = await ai_service.calculate_move_power(
            move_name=request.move_name,
            move_description=request.move_description,
            difficulty_level=request.difficulty_level
        )
        
        return PowerCalculationResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in power calculation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate move power. Please try again."
        )

@router.get("/health", response_model=AIHealthResponse)
async def check_ai_health() -> AIHealthResponse:
    """
    AI サービス（LM Studio）の健康状態を確認
    
    LM Studioの接続状態と利用可能なモデルを確認します。
    """
    try:
        health_info = await ai_service.health_check()
        return AIHealthResponse(**health_info)
        
    except Exception as e:
        logger.error(f"Error in AI health check: {e}")
        return AIHealthResponse(
            status="error",
            error=str(e)
        )

@router.post("/suggest-power", response_model=PowerCalculationResponse, status_code=status.HTTP_200_OK)
async def suggest_move_power_simple(
    request: PowerCalculationRequest
) -> PowerCalculationResponse:
    """
    シンプルなMove威力提案API（フォーム用）
    
    より簡単なインターフェイスでタスクの威力を計算します。
    """
    try:
        result = await ai_service.calculate_move_power(
            move_name=request.move_name,
            move_description=request.move_description,
            difficulty_level=request.difficulty_level
        )
        
        return PowerCalculationResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in power suggestion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to suggest move power. Please try again."
        )