from fastapi import APIRouter, Depends, HTTPException

from app.constants import LOCAL_USER_ID
from app.models.schemas import ConsistencyRequest, ConsistencyResponse
from app.services.consistency import ConsistencyService, get_consistency_service
from app.services.rag_engine import MissingApiKeyError


router = APIRouter(prefix="/consistency", tags=["consistency"])


@router.post("/check", response_model=ConsistencyResponse)
def check_consistency(
    request: ConsistencyRequest,
    service: ConsistencyService = Depends(get_consistency_service),
) -> ConsistencyResponse:
    try:
        return service.check(request.text, request.document_ids, user_id=LOCAL_USER_ID)
    except MissingApiKeyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}") from exc
