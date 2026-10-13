"""Authentication service using Supabase Auth."""
from __future__ import annotations
import uuid
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_supabase, get_anon_supabase
from config import get_settings
from schemas import RegisterRequest, LoginRequest, AuthResponse, UserOut

bearer_scheme = HTTPBearer(auto_error=False)


async def register_user(req: RegisterRequest) -> AuthResponse:
    sb = get_supabase()
    # Create auth user via Supabase Auth Admin API
    try:
        result = sb.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,
            "user_metadata": {"full_name": req.full_name, "role": req.role}
        })
    except Exception as e:
        err_msg = str(e)
        if "already been registered" in err_msg.lower() or "already exists" in err_msg.lower():
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists.")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=err_msg)

    user_id = result.user.id

    # Upsert into our users table
    sb.table("users").upsert({
        "id": user_id,
        "email": req.email,
        "full_name": req.full_name,
        "role": req.role,
    }).execute()

    # Sign in with anon client to get session token without mutating admin client
    return await _sign_in(req.email, req.password, req.role, req.full_name, user_id)


async def login_user(req: LoginRequest) -> AuthResponse:
    sb = get_supabase()
    anon_sb = get_anon_supabase()
    try:
        result = anon_sb.auth.sign_in_with_password({"email": req.email, "password": req.password})
    except Exception as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    user_id = result.user.id
    access_token = result.session.access_token

    # Fetch user row
    row = sb.table("users").select("*").eq("id", user_id).single().execute()
    if not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User record not found")

    return AuthResponse(
        access_token=access_token,
        user_id=user_id,
        role=row.data["role"],
        full_name=row.data["full_name"],
    )


async def _sign_in(email: str, password: str, role: str, full_name: str, user_id: str) -> AuthResponse:
    anon_sb = get_anon_supabase()
    result = anon_sb.auth.sign_in_with_password({"email": email, "password": password})
    return AuthResponse(
        access_token=result.session.access_token,
        user_id=user_id,
        role=role,
        full_name=full_name,
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    """Dependency: returns the authenticated user dict or raises 401."""
    if not credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = credentials.credentials
    sb = get_supabase()
    try:
        result = sb.auth.get_user(token)
        user_id = result.user.id
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    row = sb.table("users").select("*").eq("id", user_id).single().execute()
    if not row.data:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return row.data


def require_role(*roles: str):
    """Dependency factory: raises 403 if user role not in allowed roles."""
    async def _check(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                detail=f"This action requires role: {' or '.join(roles)}"
            )
        return user
    return _check
