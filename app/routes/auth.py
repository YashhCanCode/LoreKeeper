from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import AuthResponse, GoogleAuthRequest, UserInfo
from app.services.auth import (
    InvalidGoogleTokenError,
    create_access_token,
    get_current_user,
    verify_google_id_token,
)
from app.services.users import UserService, UserStoreError, get_user_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=AuthResponse)
def google_login(
    request: GoogleAuthRequest,
    user_service: UserService = Depends(get_user_service),
) -> AuthResponse:
    try:
        claims = verify_google_id_token(request.credential)
    except InvalidGoogleTokenError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    try:
        user = user_service.get_or_create_user(
            google_sub=claims["sub"],
            email=claims.get("email", ""),
            name=claims.get("name", claims.get("email", "")),
            picture=claims.get("picture"),
        )
    except UserStoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    token = create_access_token(user.user_id)
    return AuthResponse(access_token=token, user=user)


@router.get("/me", response_model=UserInfo)
def get_me(current_user: UserInfo = Depends(get_current_user)) -> UserInfo:
    return current_user
