from fastapi import APIRouter, Depends, HTTPException

from app.constants import LOCAL_USER_ID
from app.models.schemas import (
    ChatSessionDetail,
    ChatSessionInfo,
    ChatSessionListResponse,
    CreateChatSessionRequest,
    MessageResponse,
)
from app.services.chat_history import ChatHistoryError, ChatHistoryService, get_chat_history_service

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=ChatSessionInfo, status_code=201)
def create_session(
    request: CreateChatSessionRequest = CreateChatSessionRequest(),
    history: ChatHistoryService = Depends(get_chat_history_service),
) -> ChatSessionInfo:
    try:
        return history.create_session(LOCAL_USER_ID, request.title)
    except ChatHistoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("", response_model=ChatSessionListResponse)
def list_sessions(
    history: ChatHistoryService = Depends(get_chat_history_service),
) -> ChatSessionListResponse:
    try:
        sessions = history.list_sessions(LOCAL_USER_ID)
    except ChatHistoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return ChatSessionListResponse(sessions=sessions, total=len(sessions))


@router.get("/{session_id}", response_model=ChatSessionDetail)
def get_session(
    session_id: str,
    history: ChatHistoryService = Depends(get_chat_history_service),
) -> ChatSessionDetail:
    try:
        title = history.get_session_title(session_id, LOCAL_USER_ID)
        if title is None:
            raise HTTPException(status_code=404, detail="Chat session not found.")
        messages = history.get_messages(session_id, LOCAL_USER_ID)
    except ChatHistoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return ChatSessionDetail(session_id=session_id, title=title, messages=messages)


@router.delete("/{session_id}", response_model=MessageResponse)
def delete_session(
    session_id: str,
    history: ChatHistoryService = Depends(get_chat_history_service),
) -> MessageResponse:
    try:
        deleted = history.delete_session(session_id, LOCAL_USER_ID)
    except ChatHistoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not deleted:
        raise HTTPException(status_code=404, detail="Chat session not found.")
    return MessageResponse(message="Chat session deleted.")
