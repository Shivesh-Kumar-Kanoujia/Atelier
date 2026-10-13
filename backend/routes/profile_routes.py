"""Profile routes: creator and brand profiles."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from schemas import (
    CreatorProfileCreate, CreatorProfileUpdate, CreatorProfileOut,
    BrandProfileCreate, BrandProfileUpdate, BrandProfileOut,
)
from auth import get_current_user, require_role
from database import get_supabase

router = APIRouter(prefix="/profiles", tags=["profiles"])


# ─── Creator ─────────────────────────────────────────────────────────────────

@router.get("/creator/me", response_model=CreatorProfileOut)
async def get_my_creator_profile(user: dict = Depends(require_role("creator"))):
    sb = get_supabase()
    row = sb.table("creator_profiles").select("*").eq("user_id", user["id"]).maybe_single().execute()
    if not row or not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Creator profile not found. Complete onboarding.")
    return CreatorProfileOut(**row.data)


@router.post("/creator", response_model=CreatorProfileOut, status_code=201)
async def create_creator_profile(req: CreatorProfileCreate, user: dict = Depends(require_role("creator"))):
    sb = get_supabase()
    existing = sb.table("creator_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if existing and existing.data:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Creator profile already exists. Use PATCH to update.")

    data = req.model_dump()
    data["user_id"] = user["id"]
    if data.get("socials"):
        data["socials"] = data["socials"] if isinstance(data["socials"], dict) else data["socials"].model_dump()

    row = sb.table("creator_profiles").insert(data).execute()
    return CreatorProfileOut(**row.data[0])


@router.patch("/creator/me", response_model=CreatorProfileOut)
async def update_creator_profile(req: CreatorProfileUpdate, user: dict = Depends(require_role("creator"))):
    sb = get_supabase()
    existing = sb.table("creator_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if not existing or not existing.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Profile not found")

    updates = {k: v for k, v in req.model_dump(exclude_none=True).items()}
    if "socials" in updates and updates["socials"] is not None:
        updates["socials"] = updates["socials"] if isinstance(updates["socials"], dict) else updates["socials"].model_dump()

    row = sb.table("creator_profiles").update(updates).eq("user_id", user["id"]).execute()
    return CreatorProfileOut(**row.data[0])


@router.get("/creator/{creator_id}", response_model=CreatorProfileOut)
async def get_creator_profile(creator_id: str):
    sb = get_supabase()
    row = sb.table("creator_profiles").select("*").eq("id", creator_id).maybe_single().execute()
    if not row or not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Creator not found")
    return CreatorProfileOut(**row.data)


import uuid
from typing import Optional

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

def _validate_image_content(content: bytes, content_type: Optional[str], filename: Optional[str] = None) -> str:
    if not content_type or content_type.lower() not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File must be a supported image format (JPEG, PNG, WebP, GIF)"
        )
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size exceeds the 10 MB limit"
        )
    ext = "jpg"
    if content_type == "image/png":
        ext = "png"
    elif content_type == "image/webp":
        ext = "webp"
    elif content_type == "image/gif":
        ext = "gif"
    elif filename and "." in filename:
        raw_ext = filename.rsplit(".", 1)[-1].lower()
        if raw_ext in ("jpg", "jpeg", "png", "webp", "gif"):
            ext = raw_ext
    return ext


@router.post("/creator/me/avatar", status_code=200)
async def upload_avatar(
    file: UploadFile = File(...),
    user: dict = Depends(require_role("creator"))
):
    content = await file.read()
    ext = _validate_image_content(content, file.content_type, file.filename)
    sb = get_supabase()
    unique_name = f"{uuid.uuid4().hex[:16]}.{ext}"
    path = f"avatars/{user['id']}/{unique_name}"
    sb.storage.from_("creator-media").upload(
        path, content, {"content-type": file.content_type, "upsert": "true"}
    )
    url = sb.storage.from_("creator-media").get_public_url(path)
    sb.table("creator_profiles").update({"avatar_url": url}).eq("user_id", user["id"]).execute()
    return {"avatar_url": url}


@router.delete("/creator/me/avatar", status_code=200)
async def delete_avatar(
    user: dict = Depends(require_role("creator"))
):
    sb = get_supabase()
    existing = sb.table("creator_profiles").select("avatar_url").eq("user_id", user["id"]).maybe_single().execute()
    if existing and existing.data and existing.data.get("avatar_url"):
        old_url = existing.data["avatar_url"]
        try:
            old_path = old_url.split("/creator-media/")[-1]
            sb.storage.from_("creator-media").remove([old_path])
        except Exception:
            pass
    sb.table("creator_profiles").update({"avatar_url": None}).eq("user_id", user["id"]).execute()
    return {"avatar_url": None}


@router.post("/creator/me/cover", status_code=200)
async def upload_cover(
    file: UploadFile = File(...),
    user: dict = Depends(require_role("creator"))
):
    content = await file.read()
    ext = _validate_image_content(content, file.content_type, file.filename)
    sb = get_supabase()
    unique_name = f"{uuid.uuid4().hex[:16]}.{ext}"
    path = f"covers/{user['id']}/{unique_name}"
    sb.storage.from_("creator-media").upload(
        path, content, {"content-type": file.content_type, "upsert": "true"}
    )
    url = sb.storage.from_("creator-media").get_public_url(path)
    sb.table("creator_profiles").update({"cover_url": url}).eq("user_id", user["id"]).execute()
    return {"cover_url": url}


# ─── Brand ───────────────────────────────────────────────────────────────────

@router.get("/brand/me", response_model=BrandProfileOut)
async def get_my_brand_profile(user: dict = Depends(require_role("brand"))):
    sb = get_supabase()
    row = sb.table("brand_profiles").select("*").eq("user_id", user["id"]).maybe_single().execute()
    if not row or not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Brand profile not found. Complete onboarding.")
    return BrandProfileOut(**row.data)


@router.post("/brand", response_model=BrandProfileOut, status_code=201)
async def create_brand_profile(req: BrandProfileCreate, user: dict = Depends(require_role("brand"))):
    sb = get_supabase()
    existing = sb.table("brand_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if existing and existing.data:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Brand profile already exists.")

    data = req.model_dump()
    data["user_id"] = user["id"]
    row = sb.table("brand_profiles").insert(data).execute()
    return BrandProfileOut(**row.data[0])


@router.patch("/brand/me", response_model=BrandProfileOut)
async def update_brand_profile(req: BrandProfileUpdate, user: dict = Depends(require_role("brand"))):
    sb = get_supabase()
    updates = {k: v for k, v in req.model_dump(exclude_none=True).items()}
    row = sb.table("brand_profiles").update(updates).eq("user_id", user["id"]).execute()
    if not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Brand profile not found")
    return BrandProfileOut(**row.data[0])


@router.post("/brand/me/logo", status_code=200)
async def upload_brand_logo(
    file: UploadFile = File(...),
    user: dict = Depends(require_role("brand"))
):
    content = await file.read()
    ext = _validate_image_content(content, file.content_type, file.filename)
    sb = get_supabase()
    unique_name = f"{uuid.uuid4().hex[:16]}.{ext}"
    path = f"logos/{user['id']}/{unique_name}"
    sb.storage.from_("creator-media").upload(
        path, content, {"content-type": file.content_type, "upsert": "true"}
    )
    url = sb.storage.from_("creator-media").get_public_url(path)
    sb.table("brand_profiles").update({"logo_url": url}).eq("user_id", user["id"]).execute()
    return {"logo_url": url}


@router.delete("/brand/me/logo", status_code=200)
async def delete_brand_logo(
    user: dict = Depends(require_role("brand"))
):
    sb = get_supabase()
    existing = sb.table("brand_profiles").select("logo_url").eq("user_id", user["id"]).maybe_single().execute()
    if existing and existing.data and existing.data.get("logo_url"):
        old_url = existing.data["logo_url"]
        try:
            old_path = old_url.split("/creator-media/")[-1]
            sb.storage.from_("creator-media").remove([old_path])
        except Exception:
            pass
    sb.table("brand_profiles").update({"logo_url": None}).eq("user_id", user["id"]).execute()
    return {"logo_url": None}
