"""Campaign (brief) routes."""
from __future__ import annotations
import random
import string
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, Literal
from schemas import CampaignCreate, CampaignUpdate, CampaignOut
from auth import get_current_user, require_role
from database import get_supabase

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


def _make_code() -> str:
    return "BRIEF-" + "".join(random.choices(string.digits, k=4))


def _get_brand_id(user_id: str) -> str:
    sb = get_supabase()
    row = sb.table("brand_profiles").select("id").eq("user_id", user_id).maybe_single().execute()
    if not row or not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Brand profile not found. Complete onboarding first.")
    return row.data["id"]


@router.get("", response_model=list[CampaignOut])
async def list_campaigns(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
):
    """Public listing — only published/reviewing/in_production campaigns."""
    sb = get_supabase()
    q = sb.table("campaigns").select("*").in_("status", ["published", "reviewing", "in_production"])
    if status:
        q = sb.table("campaigns").select("*").eq("status", status)
    offset = (page - 1) * page_size
    rows = q.order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
    return [CampaignOut(**r) for r in rows.data]


@router.get("/mine", response_model=list[CampaignOut])
async def list_my_campaigns(user: dict = Depends(require_role("brand"))):
    brand_id = _get_brand_id(user["id"])
    sb = get_supabase()
    rows = sb.table("campaigns").select("*").eq("brand_id", brand_id).order("created_at", desc=True).execute()
    return [CampaignOut(**r) for r in rows.data]


@router.get("/{campaign_id}", response_model=CampaignOut)
async def get_campaign(campaign_id: str):
    sb = get_supabase()
    row = sb.table("campaigns").select("*").eq("id", campaign_id).maybe_single().execute()
    if not row or not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    camp = row.data
    # Only expose drafts to owners (handled by RLS; here we expose freely if published)
    if camp["status"] == "draft":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="This campaign is a draft")
    return CampaignOut(**camp)


@router.get("/{campaign_id}/full", response_model=CampaignOut)
async def get_campaign_full(campaign_id: str, user: dict = Depends(require_role("brand"))):
    """Brand owner can see any status including draft."""
    brand_id = _get_brand_id(user["id"])
    sb = get_supabase()
    row = sb.table("campaigns").select("*").eq("id", campaign_id).eq("brand_id", brand_id).maybe_single().execute()
    if not row or not row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Campaign not found or not yours")
    return CampaignOut(**row.data)


@router.post("", response_model=CampaignOut, status_code=201)
async def create_campaign(req: CampaignCreate, user: dict = Depends(require_role("brand"))):
    brand_id = _get_brand_id(user["id"])
    sb = get_supabase()
    data = req.model_dump()
    data["brand_id"] = brand_id
    data["code"] = _make_code()
    data["status"] = "draft"
    data["proposals_count"] = 0
    if data.get("deadline"):
        data["deadline"] = str(data["deadline"])
    row = sb.table("campaigns").insert(data).execute()
    return CampaignOut(**row.data[0])


@router.patch("/{campaign_id}", response_model=CampaignOut)
async def update_campaign(campaign_id: str, req: CampaignUpdate, user: dict = Depends(require_role("brand"))):
    brand_id = _get_brand_id(user["id"])
    sb = get_supabase()
    existing = sb.table("campaigns").select("brand_id, status").eq("id", campaign_id).maybe_single().execute()
    if not existing or not existing.data or existing.data["brand_id"] != brand_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your campaign")
    if existing.data["status"] in ("completed", "closed"):
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Cannot edit a completed or closed campaign")

    updates = {k: v for k, v in req.model_dump(exclude_none=True).items()}
    if "deadline" in updates and updates["deadline"]:
        updates["deadline"] = str(updates["deadline"])
    row = sb.table("campaigns").update(updates).eq("id", campaign_id).execute()
    return CampaignOut(**row.data[0])


@router.post("/{campaign_id}/publish", response_model=CampaignOut)
async def publish_campaign(campaign_id: str, user: dict = Depends(require_role("brand"))):
    brand_id = _get_brand_id(user["id"])
    sb = get_supabase()
    existing = sb.table("campaigns").select("brand_id, status, title").eq("id", campaign_id).maybe_single().execute()
    if not existing or not existing.data or existing.data["brand_id"] != brand_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your campaign")
    if existing.data["status"] not in ("draft",):
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Campaign is already published")

    row = sb.table("campaigns").update({
        "status": "reviewing",
        "status_label": "Reviewing Pitches (0 Received)"
    }).eq("id", campaign_id).execute()
    return CampaignOut(**row.data[0])


@router.post("/{campaign_id}/close", response_model=CampaignOut)
async def close_campaign(campaign_id: str, user: dict = Depends(require_role("brand"))):
    brand_id = _get_brand_id(user["id"])
    sb = get_supabase()
    existing = sb.table("campaigns").select("brand_id").eq("id", campaign_id).maybe_single().execute()
    if not existing or not existing.data or existing.data["brand_id"] != brand_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your campaign")

    row = sb.table("campaigns").update({"status": "closed", "status_label": "Closed"}).eq("id", campaign_id).execute()
    return CampaignOut(**row.data[0])
