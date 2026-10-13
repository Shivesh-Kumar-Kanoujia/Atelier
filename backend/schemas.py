"""Pydantic schemas for all API request/response models."""
from __future__ import annotations
from datetime import datetime, date
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field, HttpUrl


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=100)
    role: Literal["creator", "brand"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    full_name: str


class UserOut(BaseModel):
    id: str
    email: str
    role: str
    full_name: str
    created_at: datetime


# ─── Creator Profile ─────────────────────────────────────────────────────────

class SocialLinks(BaseModel):
    vimeo: Optional[str] = None
    behance: Optional[str] = None
    github: Optional[str] = None
    email: Optional[str] = None


class CreatorProfileCreate(BaseModel):
    display_name: str = Field(min_length=2, max_length=100)
    handle: str = Field(min_length=2, max_length=50, pattern=r'^@?[a-zA-Z0-9_]+$')
    title: str = Field(max_length=120)
    discipline: Literal[
        "AI Filmmaker", "3D & Neural Animator", "Concept Artist",
        "Visual Effects", "Motion Designer", "Sound Designer"
    ]
    location: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    tools: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    styles: list[str] = Field(default_factory=list)
    formats: list[str] = Field(default_factory=list)
    availability: Literal["Available Now", "Available in 2 Weeks", "Booking Next Month"] = "Available Now"
    starting_rate: Optional[int] = Field(None, ge=0)
    rate_tier: Optional[str] = None
    response_time: Optional[str] = None
    socials: Optional[SocialLinks] = None


class CreatorProfileUpdate(CreatorProfileCreate):
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    handle: Optional[str] = Field(None, min_length=2, max_length=50)
    title: Optional[str] = Field(None, max_length=120)
    discipline: Optional[str] = None
    availability: Optional[str] = None


class CreatorProfileOut(BaseModel):
    id: str
    user_id: str
    display_name: str
    handle: str
    title: str
    discipline: str
    location: Optional[str]
    bio: Optional[str]
    tools: list[str]
    skills: list[str]
    styles: list[str]
    formats: list[str]
    availability: str
    starting_rate: Optional[int]
    rate_tier: Optional[str]
    response_time: Optional[str]
    avatar_url: Optional[str]
    cover_url: Optional[str]
    socials: Optional[dict]
    stats: Optional[dict]
    created_at: datetime
    updated_at: Optional[datetime]


# ─── Brand Profile ───────────────────────────────────────────────────────────

class BrandProfileCreate(BaseModel):
    org_name: str = Field(min_length=2, max_length=100)
    industry: Optional[str] = Field(None, max_length=80)
    website: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)


class BrandProfileUpdate(BrandProfileCreate):
    org_name: Optional[str] = Field(None, min_length=2, max_length=100)


class BrandProfileOut(BaseModel):
    id: str
    user_id: str
    org_name: str
    industry: Optional[str]
    website: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    logo_url: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]


# ─── Portfolio ───────────────────────────────────────────────────────────────

class PortfolioItemCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=400)
    type: Optional[str] = None
    category: Optional[str] = None
    aspect_ratio: Optional[str] = None
    duration: Optional[str] = None
    badge: Optional[str] = None
    client_badge: Optional[str] = None
    tools: list[str] = Field(default_factory=list)
    workflow: Optional[str] = Field(None, max_length=600)
    output: Optional[str] = None


class PortfolioItemOut(PortfolioItemCreate):
    id: str
    creator_id: str
    media_url: Optional[str]
    thumbnail_url: Optional[str]
    created_at: datetime


# ─── Campaigns ───────────────────────────────────────────────────────────────

CampaignStatus = Literal["draft", "published", "reviewing", "in_production", "completed", "closed"]


class CampaignCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    client: str = Field(min_length=2, max_length=100)
    objective: str = Field(max_length=100)
    content_type: str = Field(max_length=100)
    description: str = Field(max_length=2000)
    budget_tier: Optional[str] = None
    budget_amount: Optional[int] = Field(None, ge=0)
    deadline: Optional[date] = None
    commercial_rights: Optional[str] = None
    styles: list[str] = Field(default_factory=list)
    aspect_ratios: list[str] = Field(default_factory=list)
    deliverables: list[str] = Field(default_factory=list)
    required_tools: list[str] = Field(default_factory=list)
    reference_links: list[str] = Field(default_factory=list)
    audio_notes: Optional[str] = Field(None, max_length=500)


class CampaignUpdate(CampaignCreate):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    client: Optional[str] = Field(None, min_length=2, max_length=100)
    objective: Optional[str] = None
    content_type: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CampaignStatus] = None


class CampaignOut(BaseModel):
    id: str
    brand_id: str
    code: str
    title: str
    client: str
    status: str
    status_label: Optional[str]
    objective: str
    content_type: str
    description: str
    budget_tier: Optional[str]
    budget_amount: Optional[int]
    deadline: Optional[date]
    commercial_rights: Optional[str]
    commercial_rights_summary: Optional[str]
    styles: list[str]
    aspect_ratios: list[str]
    deliverables: list[str]
    required_tools: list[str]
    reference_links: list[str]
    audio_notes: Optional[str]
    proposals_count: int
    assigned_creator_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]


# ─── AI Brief Generation ─────────────────────────────────────────────────────

class BriefGenerateRequest(BaseModel):
    idea: str = Field(min_length=10, max_length=2000, description="Brand's campaign idea in plain language")
    brand_name: Optional[str] = Field(None, max_length=100)
    budget_hint: Optional[str] = None
    deadline_hint: Optional[str] = None


class AIBriefDraft(BaseModel):
    title: str
    client: str
    objective: str
    content_type: str
    description: str
    styles: list[str]
    aspect_ratios: list[str]
    deliverables: list[str]
    required_tools: list[str]
    budget_tier: Optional[str] = None
    deadline: Optional[str] = None
    commercial_rights: Optional[str] = None
    audio_notes: Optional[str] = None
    missing_info: list[str] = Field(default_factory=list)


# ─── Shortlist / Invitation / Engagement ─────────────────────────────────────

class ShortlistToggle(BaseModel):
    creator_id: str


class InvitationCreate(BaseModel):
    campaign_id: str
    creator_id: str
    message: Optional[str] = Field(None, max_length=1000)


InvitationStatus = Literal["pending", "accepted", "rejected", "withdrawn"]


class InvitationOut(BaseModel):
    id: str
    campaign_id: str
    creator_id: str
    brand_id: str
    status: str
    message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]


class InvitationRespond(BaseModel):
    status: Literal["accepted", "rejected"]


class EngagementOut(BaseModel):
    id: str
    campaign_id: str
    creator_id: str
    brand_id: str
    status: Literal["active", "completed", "cancelled"]
    created_at: datetime
    updated_at: Optional[datetime]


# ─── Discovery ───────────────────────────────────────────────────────────────

class CreatorDiscoveryFilters(BaseModel):
    discipline: Optional[str] = None
    tools: Optional[list[str]] = None
    styles: Optional[list[str]] = None
    availability: Optional[str] = None
    min_rate: Optional[int] = None
    max_rate: Optional[int] = None
    search: Optional[str] = None
    sort: Optional[Literal["recommended", "rate_asc", "rate_desc", "rating"]] = "recommended"
    page: int = Field(1, ge=1)
    page_size: int = Field(12, ge=1, le=50)


class MatchBreakdown(BaseModel):
    type: str
    text: str
    icon: str
    highlight: bool = False


class CreatorWithMatch(BaseModel):
    creator: CreatorProfileOut
    match_score: Optional[int] = None
    match_breakdown: Optional[list[MatchBreakdown]] = None


class PaginatedCreators(BaseModel):
    items: list[CreatorWithMatch]
    total: int
    page: int
    page_size: int
    pages: int
