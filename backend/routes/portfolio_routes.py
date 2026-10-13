"""Portfolio routes for creators."""
from __future__ import annotations
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from schemas import PortfolioItemCreate, PortfolioItemUpdate, PortfolioItemOut
from auth import get_current_user, require_role
from database import get_supabase

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


def _get_creator_id(user_id: str) -> str:
    sb = get_supabase()
    row = sb.table("creator_profiles").select("id").eq("user_id", user_id).maybe_single().execute()
    if not row or not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Creator profile not found. Complete onboarding first.")
    return row.data["id"]


@router.get("/mine", response_model=list[PortfolioItemOut])
@router.get("/me", response_model=list[PortfolioItemOut])
async def list_my_portfolio(user: dict = Depends(require_role("creator"))):
    creator_id = _get_creator_id(user["id"])
    sb = get_supabase()
    rows = sb.table("portfolio_items").select("*").eq("creator_id", creator_id).order("created_at", desc=True).execute()
    return [PortfolioItemOut(**r) for r in rows.data]


@router.get("/{creator_id}", response_model=list[PortfolioItemOut])
async def list_portfolio(creator_id: str):
    sb = get_supabase()
    rows = sb.table("portfolio_items").select("*").eq("creator_id", creator_id).order("created_at", desc=True).execute()
    return [PortfolioItemOut(**r) for r in rows.data]


@router.post("", response_model=PortfolioItemOut, status_code=201)
async def create_portfolio_item(req: PortfolioItemCreate, user: dict = Depends(require_role("creator"))):
    creator_id = _get_creator_id(user["id"])
    sb = get_supabase()
    data = req.model_dump()
    data["creator_id"] = creator_id
    row = sb.table("portfolio_items").insert(data).execute()
    return PortfolioItemOut(**row.data[0])


@router.patch("/{item_id}", response_model=PortfolioItemOut)
async def update_portfolio_item(item_id: str, req: PortfolioItemUpdate, user: dict = Depends(require_role("creator"))):
    creator_id = _get_creator_id(user["id"])
    sb = get_supabase()
    existing = sb.table("portfolio_items").select("creator_id").eq("id", item_id).maybe_single().execute()
    if not existing or not existing.data or existing.data["creator_id"] != creator_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your portfolio item")

    updates = {k: v for k, v in req.model_dump(exclude_none=True).items()}
    row = sb.table("portfolio_items").update(updates).eq("id", item_id).execute()
    return PortfolioItemOut(**row.data[0])


@router.delete("/{item_id}", status_code=204)
async def delete_portfolio_item(item_id: str, user: dict = Depends(require_role("creator"))):
    creator_id = _get_creator_id(user["id"])
    sb = get_supabase()
    existing = sb.table("portfolio_items").select("creator_id, media_url, thumbnail_url").eq("id", item_id).maybe_single().execute()
    if not existing or not existing.data or existing.data["creator_id"] != creator_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your portfolio item")

    # Clean up storage if there are media files
    to_remove = []
    for field in ("media_url", "thumbnail_url"):
        val = existing.data.get(field)
        if val and "/creator-media/" in val:
            to_remove.append(val.split("/creator-media/")[-1])
    if to_remove:
        try:
            sb.storage.from_("creator-media").remove(to_remove)
        except Exception:
            pass

    sb.table("portfolio_items").delete().eq("id", item_id).execute()
    return None


@router.post("/{item_id}/media", status_code=200)
async def upload_portfolio_media(
    item_id: str,
    file: UploadFile = File(...),
    user: dict = Depends(require_role("creator"))
):
    creator_id = _get_creator_id(user["id"])
    sb = get_supabase()
    existing = sb.table("portfolio_items").select("creator_id").eq("id", item_id).maybe_single().execute()
    if not existing or not existing.data or existing.data["creator_id"] != creator_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your portfolio item")

    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"}
    if not file.content_type or file.content_type.lower() not in allowed:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unsupported file type. Please upload JPEG, PNG, WebP, GIF, MP4, or WebM.")

    content = await file.read()
    if len(content) > 15 * 1024 * 1024:  # 15 MB limit
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 15 MB size limit")

    ext = "jpg"
    if file.filename and "." in file.filename:
        raw_ext = file.filename.rsplit(".", 1)[-1].lower()
        if raw_ext in ("jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"):
            ext = raw_ext
    elif file.content_type == "image/png":
        ext = "png"
    elif file.content_type == "image/webp":
        ext = "webp"
    elif file.content_type == "video/mp4":
        ext = "mp4"

    unique_name = f"{uuid.uuid4().hex[:16]}.{ext}"
    path = f"portfolio/{creator_id}/{item_id}/{unique_name}"
    sb.storage.from_("creator-media").upload(
        path, content, {"content-type": file.content_type, "upsert": "true"}
    )
    url = sb.storage.from_("creator-media").get_public_url(path)

    updates = {}
    if file.content_type.startswith("image/"):
        updates["thumbnail_url"] = url
        updates["media_url"] = url
    else:
        updates["media_url"] = url

    sb.table("portfolio_items").update(updates).eq("id", item_id).execute()
    return updates
