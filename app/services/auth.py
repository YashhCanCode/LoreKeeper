from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.config import get_settings
from app.models.schemas import UserInfo
from app.services.users import UserService, UserStoreError, get_user_service


class InvalidGoogleTokenError(ValueError):
    pass


_bearer_scheme = HTTPBearer(auto_error=False)


def verify_google_id_token(credential: str) -> dict:
    settings = get_settings()
    if not settings.google_client_id:
        raise InvalidGoogleTokenError("GOOGLE_CLIENT_ID is not configured on the server.")
    try:
        claims = google_id_token.verify_oauth2_token(
            credential, google_requests.Request(), settings.google_client_id
        )
    except Exception as exc:  # invalid signature, expired, wrong audience, etc.
        raise InvalidGoogleTokenError(f"Invalid Google credential: {exc}") from exc

    if claims.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise InvalidGoogleTokenError("Invalid token issuer.")
    return claims


def create_access_token(user_id: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> str:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please sign in again.",
        ) from exc
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token.")
    return user_id


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    user_service: UserService = Depends(get_user_service),
) -> UserInfo:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sign in required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = decode_access_token(credentials.credentials)
    try:
        user = user_service.get_user(user_id)
    except UserStoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user
