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
    if not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Creator profile not found. Complete onboarding.")
    return CreatorProfileOut(**row.data)


@router.post("/creator", response_model=CreatorProfileOut, status_code=201)
async def create_creator_profile(req: CreatorProfileCreate, user: dict = Depends(require_role("creator"))):
    sb = get_supabase()
    existing = sb.table("creator_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if existing.data:
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
    if not existing.data:
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
    if not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Creator not found")
    return CreatorProfileOut(**row.data)


@router.post("/creator/me/avatar", status_code=200)
async def upload_avatar(
    file: UploadFile = File(...),
    user: dict = Depends(require_role("creator"))
):
    _validate_image(file)
    sb = get_supabase()
    path = f"avatars/{user['id']}/{file.filename}"
    content = await file.read()
    sb.storage.from_("creator-media").upload(path, content, {"content-type": file.content_type, "upsert": "true"})
    url = sb.storage.from_("creator-media").get_public_url(path)
    sb.table("creator_profiles").update({"avatar_url": url}).eq("user_id", user["id"]).execute()
    return {"avatar_url": url}


@router.post("/creator/me/cover", status_code=200)
async def upload_cover(
    file: UploadFile = File(...),
    user: dict = Depends(require_role("creator"))
):
    _validate_image(file)
    sb = get_supabase()
    path = f"covers/{user['id']}/{file.filename}"
    content = await file.read()
    sb.storage.from_("creator-media").upload(path, content, {"content-type": file.content_type, "upsert": "true"})
    url = sb.storage.from_("creator-media").get_public_url(path)
    sb.table("creator_profiles").update({"cover_url": url}).eq("user_id", user["id"]).execute()
    return {"cover_url": url}


def _validate_image(file: UploadFile):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="File must be an image")
    # 10 MB limit checked by content-length header
    max_bytes = 10 * 1024 * 1024
    if file.size and file.size > max_bytes:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image must be under 10 MB")


# ─── Brand ───────────────────────────────────────────────────────────────────

@router.get("/brand/me", response_model=BrandProfileOut)
async def get_my_brand_profile(user: dict = Depends(require_role("brand"))):
    sb = get_supabase()
    row = sb.table("brand_profiles").select("*").eq("user_id", user["id"]).maybe_single().execute()
    if not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Brand profile not found. Complete onboarding.")
    return BrandProfileOut(**row.data)


@router.post("/brand", response_model=BrandProfileOut, status_code=201)
async def create_brand_profile(req: BrandProfileCreate, user: dict = Depends(require_role("brand"))):
    sb = get_supabase()
    existing = sb.table("brand_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if existing.data:
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
