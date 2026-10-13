"""Auth routes: register, login, logout, me."""
from fastapi import APIRouter, Depends
from schemas import RegisterRequest, LoginRequest, AuthResponse, UserOut
from auth import register_user, login_user, get_current_user
from database import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(req: RegisterRequest):
    return await register_user(req)


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    return await login_user(req)


@router.post("/logout", status_code=204)
async def logout(user: dict = Depends(get_current_user)):
    # Token invalidation is handled client-side (remove from storage)
    return None


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    from datetime import datetime
    return UserOut(
        id=user["id"],
        email=user["email"],
        role=user["role"],
        full_name=user["full_name"],
        created_at=user.get("created_at", datetime.utcnow()),
    )
