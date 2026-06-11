from __future__ import annotations

from datetime import datetime, timezone
from functools import lru_cache
from typing import Any
from uuid import uuid4

from pymongo import DESCENDING, MongoClient
from pymongo.errors import PyMongoError

from app.config import get_settings
from app.models.schemas import ChatMessageOut, ChatSessionInfo, SourceChunk


class ChatHistoryError(RuntimeError):
    """Raised when the chat history store (MongoDB) cannot be reached."""


class ChatHistoryService:
    def __init__(self) -> None:
        settings = get_settings()
        self._uri = settings.mongodb_uri
        self._db_name = settings.mongodb_db_name
        self._client: MongoClient | None = None

    @property
    def _db(self):
        if self._client is None:
            self._client = MongoClient(self._uri, serverSelectionTimeoutMS=3000)
        return self._client[self._db_name]

    def _sessions(self):
        return self._db["chat_sessions"]

    def _messages(self):
        return self._db["chat_messages"]

    def create_session(self, user_id: str, title: str | None = None) -> ChatSessionInfo:
        now = datetime.now(timezone.utc).isoformat()
        session_id = str(uuid4())
        doc = {
            "session_id": session_id,
            "user_id": user_id,
            "title": title or "New chat",
            "created_at": now,
            "updated_at": now,
        }
        try:
            self._sessions().insert_one(doc)
        except PyMongoError as exc:
            raise ChatHistoryError(f"Could not reach MongoDB: {exc}") from exc
        return ChatSessionInfo(
            session_id=session_id,
            title=doc["title"],
            created_at=now,
            updated_at=now,
            message_count=0,
        )

    def list_sessions(self, user_id: str) -> list[ChatSessionInfo]:
        try:
            docs = list(
                self._sessions().find({"user_id": user_id}).sort("updated_at", DESCENDING)
            )
            sessions: list[ChatSessionInfo] = []
            for doc in docs:
                count = self._messages().count_documents({"session_id": doc["session_id"]})
                sessions.append(
                    ChatSessionInfo(
                        session_id=doc["session_id"],
                        title=doc.get("title", "New chat"),
                        created_at=doc["created_at"],
                        updated_at=doc["updated_at"],
                        message_count=count,
                    )
                )
            return sessions
        except PyMongoError as exc:
            raise ChatHistoryError(f"Could not reach MongoDB: {exc}") from exc

    def session_exists(self, session_id: str, user_id: str) -> bool:
        try:
            return (
                self._sessions().count_documents(
                    {"session_id": session_id, "user_id": user_id}, limit=1
                )
                > 0
            )
        except PyMongoError as exc:
            raise ChatHistoryError(f"Could not reach MongoDB: {exc}") from exc

    def get_session_title(self, session_id: str, user_id: str) -> str | None:
        try:
            doc = self._sessions().find_one(
                {"session_id": session_id, "user_id": user_id}, {"title": 1}
            )
        except PyMongoError as exc:
            raise ChatHistoryError(f"Could not reach MongoDB: {exc}") from exc
        return doc.get("title") if doc else None

    def get_messages(
        self, session_id: str, user_id: str, limit: int | None = None
    ) -> list[ChatMessageOut]:
        try:
            if not self.session_exists(session_id, user_id):
                return []
            cursor = self._messages().find({"session_id": session_id}).sort("created_at", 1)
            docs = list(cursor)
        except PyMongoError as exc:
            raise ChatHistoryError(f"Could not reach MongoDB: {exc}") from exc

        if limit:
            docs = docs[-limit:]

        messages: list[ChatMessageOut] = []
        for doc in docs:
            sources = [SourceChunk(**source) for source in doc.get("sources", [])]
            messages.append(
                ChatMessageOut(
                    role=doc["role"],
                    content=doc["content"],
                    sources=sources,
                    created_at=doc["created_at"],
                )
            )
        return messages

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        sources: list[SourceChunk] | None = None,
    ) -> None:
        now = datetime.now(timezone.utc).isoformat()
        doc: dict[str, Any] = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "sources": [source.model_dump() for source in (sources or [])],
            "created_at": now,
        }
        try:
            self._messages().insert_one(doc)
            self._sessions().update_one({"session_id": session_id}, {"$set": {"updated_at": now}})
        except PyMongoError as exc:
            raise ChatHistoryError(f"Could not reach MongoDB: {exc}") from exc

    def set_title(self, session_id: str, title: str) -> None:
        try:
            self._sessions().update_one({"session_id": session_id}, {"$set": {"title": title}})
        except PyMongoError as exc:
            raise ChatHistoryError(f"Could not reach MongoDB: {exc}") from exc

    def delete_session(self, session_id: str, user_id: str) -> bool:
        try:
            result = self._sessions().delete_one({"session_id": session_id, "user_id": user_id})
            if result.deleted_count:
                self._messages().delete_many({"session_id": session_id})
        except PyMongoError as exc:
            raise ChatHistoryError(f"Could not reach MongoDB: {exc}") from exc
        return result.deleted_count > 0


@lru_cache
def get_chat_history_service() -> ChatHistoryService:
    return ChatHistoryService()
