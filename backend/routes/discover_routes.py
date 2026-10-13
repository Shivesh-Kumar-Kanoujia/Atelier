"""Creator discovery route with filtering, sorting, pagination, and optional matching."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from schemas import PaginatedCreators, CreatorWithMatch, CreatorProfileOut
from matching import calculate_match
from database import get_supabase

router = APIRouter(prefix="/discover", tags=["discover"])


@router.get("", response_model=PaginatedCreators)
async def discover_creators(
    discipline: Optional[str] = Query(None),
    tool: Optional[str] = Query(None, description="Filter by AI tool (partial match)"),
    style: Optional[str] = Query(None, description="Filter by visual style"),
    availability: Optional[str] = Query(None),
    min_rate: Optional[int] = Query(None),
    max_rate: Optional[int] = Query(None),
    search: Optional[str] = Query(None, description="Search across name, bio, tools, skills"),
    sort: Optional[str] = Query("recommended", description="recommended|rate_asc|rate_desc|rating"),
    campaign_id: Optional[str] = Query(None, description="If provided, include match scores for this campaign"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
):
    sb = get_supabase()
    q = sb.table("creator_profiles").select("*")

    if discipline:
        q = q.ilike("discipline", f"%{discipline}%")
    if availability:
        q = q.eq("availability", availability)
    if min_rate is not None:
        q = q.gte("starting_rate", min_rate)
    if max_rate is not None:
        q = q.lte("starting_rate", max_rate)

    rows = q.execute()
    creators = rows.data or []

    # In-Python filtering for array/JSON columns
    if tool:
        t = tool.lower()
        creators = [c for c in creators if any(t in (x or "").lower() for x in (c.get("tools") or []))]
    if style:
        s = style.lower()
        creators = [c for c in creators if
                    any(s in (x or "").lower() for x in (c.get("styles") or []) + (c.get("skills") or []))]
    if search:
        kw = search.lower()
        creators = [c for c in creators if
                    kw in (c.get("display_name") or "").lower() or
                    kw in (c.get("bio") or "").lower() or
                    kw in (c.get("discipline") or "").lower() or
                    any(kw in (x or "").lower() for x in (c.get("tools") or [])) or
                    any(kw in (x or "").lower() for x in (c.get("skills") or []))]

    # Fetch campaign for matching if requested
    campaign = None
    if campaign_id:
        camp_row = sb.table("campaigns").select("*").eq("id", campaign_id).maybe_single().execute()
        campaign = camp_row.data if camp_row else None

    # Calculate match scores
    scored: list[tuple[dict, int, list]] = []
    for c in creators:
        score, breakdown = calculate_match(c, campaign)
        scored.append((c, score, breakdown))

    # Sort
    if sort == "rate_asc":
        scored.sort(key=lambda x: x[0].get("starting_rate") or 0)
    elif sort == "rate_desc":
        scored.sort(key=lambda x: x[0].get("starting_rate") or 0, reverse=True)
    elif sort == "rating":
        scored.sort(key=lambda x: (x[0].get("stats") or {}).get("rating", 0), reverse=True)
    else:  # recommended
        scored.sort(key=lambda x: x[1], reverse=True)

    total = len(scored)
    offset = (page - 1) * page_size
    page_data = scored[offset: offset + page_size]

    items = [
        CreatorWithMatch(
            creator=CreatorProfileOut(**c),
            match_score=score if campaign_id else None,
            match_breakdown=breakdown if campaign_id else None,
        )
        for c, score, breakdown in page_data
    ]

    return PaginatedCreators(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, -(-total // page_size)),
    )
