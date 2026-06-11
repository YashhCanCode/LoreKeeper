from fastapi import APIRouter, Depends, HTTPException

from app.constants import LOCAL_USER_ID
from app.models.schemas import ChatRequest, ChatResponse, CreativeRequest, CreativeResponse
from app.services.chat_history import ChatHistoryError, ChatHistoryService, get_chat_history_service
from app.services.rag_engine import MissingApiKeyError, RagEngine, get_rag_engine

router = APIRouter(prefix="/chat", tags=["chat"])


def _load_history(session_id: str | None, user_id: str, history_service: ChatHistoryService):
    if not session_id:
        return []
    try:
        if not history_service.session_exists(session_id, user_id):
            raise HTTPException(status_code=404, detail="Chat session not found.")
        return history_service.get_messages(session_id, user_id, limit=10)
    except ChatHistoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def _save_turn(
    session_id: str | None,
    history_service: ChatHistoryService,
    history,
    user_text: str,
    assistant_text: str,
    sources,
) -> None:
    if not session_id:
        return
    try:
        history_service.add_message(session_id, "user", user_text)
        history_service.add_message(session_id, "assistant", assistant_text, sources)
        if not history:
            history_service.set_title(session_id, user_text[:60])
    except ChatHistoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    rag_engine: RagEngine = Depends(get_rag_engine),
    history_service: ChatHistoryService = Depends(get_chat_history_service),
) -> ChatResponse:
    history = _load_history(request.session_id, LOCAL_USER_ID, history_service)

    try:
        response = rag_engine.answer(
            request.query, request.document_ids, history, user_id=LOCAL_USER_ID
        )
    except MissingApiKeyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}") from exc

    _save_turn(request.session_id, history_service, history, request.query, response.answer, response.sources)
    response.session_id = request.session_id
    return response


@router.post("/creative", response_model=CreativeResponse)
def creative_generation(
    request: CreativeRequest,
    rag_engine: RagEngine = Depends(get_rag_engine),
    history_service: ChatHistoryService = Depends(get_chat_history_service),
) -> CreativeResponse:
    history = _load_history(request.session_id, LOCAL_USER_ID, history_service)

    try:
        response = rag_engine.generate(
            request.prompt, request.document_ids, history, user_id=LOCAL_USER_ID
        )
    except MissingApiKeyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}") from exc

    _save_turn(request.session_id, history_service, history, request.prompt, response.content, response.sources)
    response.session_id = request.session_id
    return response
