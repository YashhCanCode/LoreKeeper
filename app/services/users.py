from __future__ import annotations

from datetime import datetime, timezone
from functools import lru_cache
from uuid import uuid4

from pymongo import MongoClient
from pymongo.errors import PyMongoError

from app.config import get_settings
from app.models.schemas import UserInfo


class UserStoreError(RuntimeError):
    """Raised when the user store (MongoDB) cannot be reached."""


class UserService:
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

    def _users(self):
        return self._db["users"]

    def get_or_create_user(
        self,
        google_sub: str,
        email: str,
        name: str,
        picture: str | None,
    ) -> UserInfo:
        now = datetime.now(timezone.utc).isoformat()
        try:
            existing = self._users().find_one({"google_sub": google_sub})
            if existing:
                self._users().update_one(
                    {"google_sub": google_sub},
                    {"$set": {"email": email, "name": name, "picture": picture, "last_login": now}},
                )
                return UserInfo(
                    user_id=existing["user_id"],
                    email=email,
                    name=name,
                    picture=picture,
                )

            user_id = str(uuid4())
            self._users().insert_one(
                {
                    "user_id": user_id,
                    "google_sub": google_sub,
                    "email": email,
                    "name": name,
                    "picture": picture,
                    "created_at": now,
                    "last_login": now,
                }
            )
            return UserInfo(user_id=user_id, email=email, name=name, picture=picture)
        except PyMongoError as exc:
            raise UserStoreError(f"Could not reach MongoDB: {exc}") from exc

    def get_user(self, user_id: str) -> UserInfo | None:
        try:
            doc = self._users().find_one({"user_id": user_id})
        except PyMongoError as exc:
            raise UserStoreError(f"Could not reach MongoDB: {exc}") from exc
        if not doc:
            return None
        return UserInfo(
            user_id=doc["user_id"],
            email=doc["email"],
            name=doc["name"],
            picture=doc.get("picture"),
        )


@lru_cache
def get_user_service() -> UserService:
    return UserService()
