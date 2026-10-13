"""Collaboration routes: shortlists, invitations, engagements."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from schemas import InvitationCreate, InvitationOut, InvitationRespond, EngagementOut
from auth import get_current_user, require_role
from database import get_supabase

router = APIRouter(tags=["collaboration"])


# ─── Shortlists ───────────────────────────────────────────────────────────────

shortlist_router = APIRouter(prefix="/shortlists")


@shortlist_router.get("", response_model=list[str])
async def get_shortlist(user: dict = Depends(require_role("brand"))):
    sb = get_supabase()
    brand_row = sb.table("brand_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if not brand_row or not brand_row.data:
        return []
    rows = sb.table("shortlists").select("creator_id").eq("brand_id", brand_row.data["id"]).execute()
    return [r["creator_id"] for r in rows.data]


@shortlist_router.post("/{creator_id}/toggle", status_code=200)
async def toggle_shortlist(creator_id: str, user: dict = Depends(require_role("brand"))):
    sb = get_supabase()
    brand_row = sb.table("brand_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if not brand_row or not brand_row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Brand profile not found")
    brand_id = brand_row.data["id"]

    existing = sb.table("shortlists").select("id").eq("brand_id", brand_id).eq("creator_id", creator_id).maybe_single().execute()
    if existing and existing.data:
        sb.table("shortlists").delete().eq("id", existing.data["id"]).execute()
        return {"shortlisted": False}
    else:
        sb.table("shortlists").insert({"brand_id": brand_id, "creator_id": creator_id}).execute()
        return {"shortlisted": True}


# ─── Invitations ─────────────────────────────────────────────────────────────

invitation_router = APIRouter(prefix="/invitations")


@invitation_router.post("", response_model=InvitationOut, status_code=201)
async def send_invitation(req: InvitationCreate, user: dict = Depends(require_role("brand"))):
    sb = get_supabase()
    brand_row = sb.table("brand_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if not brand_row or not brand_row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Brand profile not found")
    brand_id = brand_row.data["id"]

    # Verify campaign ownership
    camp = sb.table("campaigns").select("brand_id").eq("id", req.campaign_id).maybe_single().execute()
    if not camp or not camp.data or camp.data["brand_id"] != brand_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your campaign")

    # Verify creator exists
    creator = sb.table("creator_profiles").select("id").eq("id", req.creator_id).maybe_single().execute()
    if not creator or not creator.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Creator not found")

    # Check for duplicate
    dup = sb.table("invitations").select("id").eq("campaign_id", req.campaign_id).eq("creator_id", req.creator_id).maybe_single().execute()
    if dup and dup.data:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Invitation already sent to this creator for this campaign")

    data = {
        "campaign_id": req.campaign_id,
        "creator_id": req.creator_id,
        "brand_id": brand_id,
        "message": req.message,
        "status": "pending",
    }
    row = sb.table("invitations").insert(data).execute()
    return InvitationOut(**row.data[0])


@invitation_router.get("/mine", response_model=list[InvitationOut])
async def get_my_invitations(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    if user["role"] == "creator":
        creator_row = sb.table("creator_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
        if not creator_row or not creator_row.data:
            return []
        rows = sb.table("invitations").select("*").eq("creator_id", creator_row.data["id"]).order("created_at", desc=True).execute()
    else:
        brand_row = sb.table("brand_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
        if not brand_row or not brand_row.data:
            return []
        rows = sb.table("invitations").select("*").eq("brand_id", brand_row.data["id"]).order("created_at", desc=True).execute()
    return [InvitationOut(**r) for r in rows.data]


@invitation_router.patch("/{invitation_id}/respond", response_model=InvitationOut)
async def respond_to_invitation(
    invitation_id: str,
    req: InvitationRespond,
    user: dict = Depends(require_role("creator"))
):
    sb = get_supabase()
    creator_row = sb.table("creator_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if not creator_row or not creator_row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Creator profile not found")
    creator_id = creator_row.data["id"]

    inv = sb.table("invitations").select("*").eq("id", invitation_id).eq("creator_id", creator_id).maybe_single().execute()
    if not inv or not inv.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    if inv.data["status"] != "pending":
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Invitation already responded to")

    row = sb.table("invitations").update({"status": req.status}).eq("id", invitation_id).execute()

    # If accepted, create engagement
    if req.status == "accepted":
        sb.table("engagements").upsert({
            "campaign_id": inv.data["campaign_id"],
            "creator_id": creator_id,
            "brand_id": inv.data["brand_id"],
            "status": "active",
        }).execute()
        # Update campaign status
        sb.table("campaigns").update({
            "status": "in_production",
            "status_label": "In Production",
            "assigned_creator_id": creator_id,
        }).eq("id", inv.data["campaign_id"]).execute()

    return InvitationOut(**row.data[0])


# ─── Engagements ─────────────────────────────────────────────────────────────

engagement_router = APIRouter(prefix="/engagements")


@engagement_router.get("/mine", response_model=list[EngagementOut])
async def get_my_engagements(user: dict = Depends(get_current_user)):
    sb = get_supabase()
    if user["role"] == "creator":
        creator_row = sb.table("creator_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
        if not creator_row or not creator_row.data:
            return []
        rows = sb.table("engagements").select("*").eq("creator_id", creator_row.data["id"]).execute()
    else:
        brand_row = sb.table("brand_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
        if not brand_row or not brand_row.data:
            return []
        rows = sb.table("engagements").select("*").eq("brand_id", brand_row.data["id"]).execute()
    return [EngagementOut(**r) for r in rows.data]


@engagement_router.patch("/{engagement_id}/complete", response_model=EngagementOut)
async def complete_engagement(engagement_id: str, user: dict = Depends(require_role("brand"))):
    sb = get_supabase()
    brand_row = sb.table("brand_profiles").select("id").eq("user_id", user["id"]).maybe_single().execute()
    if not brand_row or not brand_row.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Brand profile not found")

    eng = sb.table("engagements").select("*").eq("id", engagement_id).eq("brand_id", brand_row.data["id"]).maybe_single().execute()
    if not eng or not eng.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Engagement not found")

    row = sb.table("engagements").update({"status": "completed"}).eq("id", engagement_id).execute()
    sb.table("campaigns").update({"status": "completed", "status_label": "Completed"}).eq("id", eng.data["campaign_id"]).execute()
    return EngagementOut(**row.data[0])


# Expose all sub-routers
def include_routers(app):
    app.include_router(shortlist_router)
    app.include_router(invitation_router)
    app.include_router(engagement_router)
