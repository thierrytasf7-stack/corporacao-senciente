from fastapi import APIRouter
from backend.core.services.metrics_service import get_metrics_service

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])

@router.get("/realtime")
async def get_realtime_metrics():
    """Retorna métricas em tempo real do sistema."""
    service = get_metrics_service()
    return service.get_summary()
