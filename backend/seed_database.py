#!/usr/bin/env python3
"""
Seed script to populate Supabase with initial Atelier creator, brand, and campaign data.
Where AI Creativity Meets Brands — Problem statement proposed by Kampus.VC.
"""
import os
import sys
import json
from dotenv import load_dotenv

# Load env vars
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from supabase import create_client, Client

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env")
        sys.exit(1)
    return create_client(url, key)

sb = get_supabase()

def load_seed_json():
    json_path = os.path.join(os.path.dirname(__file__), 'seed_data.json')
    if not os.path.exists(json_path):
        print("ERROR: seed_data.json not found")
        sys.exit(1)
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_or_create_auth_user(email: str, password: str, full_name: str, role: str) -> str:
    """Finds existing auth user by email or creates a new one, returning user id."""
    existing_users = sb.auth.admin.list_users()
    for u in existing_users:
        if getattr(u, 'email', None) == email:
            return u.id

    res = sb.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"full_name": full_name, "role": role}
    })
    return res.user.id

def seed_all():
    data = load_seed_json()
    creators = data.get("creators", [])
    briefs = data.get("briefs", [])
    proposals = data.get("proposals", [])

    print("=" * 60)
    print("Atelier Database Seeder — Where AI Creativity Meets Brands")
    print("Problem Statement proposed by Kampus.VC")
    print("=" * 60)

    # 1. Seed Brand Account & Profile
    print("\n[1/4] Seeding Brand Organization (Aura Studios)...")
    brand_email = "aura@atelier.test"
    brand_user_id = get_or_create_auth_user(brand_email, "Password123!", "Aura Studios", "brand")
    sb.table("users").upsert({
        "id": brand_user_id,
        "email": brand_email,
        "full_name": "Aura Studios",
        "role": "brand"
    }).execute()

    brand_profile_res = sb.table("brand_profiles").select("id").eq("user_id", brand_user_id).execute()
    if brand_profile_res.data:
        brand_id = brand_profile_res.data[0]["id"]
        print(f"  Brand profile exists: Aura Studios (id={brand_id})")
    else:
        new_brand = sb.table("brand_profiles").insert({
            "user_id": brand_user_id,
            "org_name": "Aura Studios",
            "industry": "Automotive & Luxury Cinema",
            "website": "https://aurastudios.design",
            "bio": "High-end luxury brand and automotive production studio partnering with leading AI directors."
        }).execute()
        brand_id = new_brand.data[0]["id"]
        print(f"  Created brand profile: Aura Studios (id={brand_id})")

    # 2. Seed Creators & Portfolios
    print("\n[2/4] Seeding Creators & Portfolios...")
    creator_id_map = {} # handle/slug -> creator_profile id

    for c in creators:
        email = f"{c['id']}@atelier.test"
        user_id = get_or_create_auth_user(email, "Password123!", c["name"], "creator")
        sb.table("users").upsert({
            "id": user_id,
            "email": email,
            "full_name": c["name"],
            "role": "creator"
        }).execute()

        existing = sb.table("creator_profiles").select("id").eq("user_id", user_id).execute()
        if existing.data:
            c_profile_id = existing.data[0]["id"]
            print(f"  Creator {c['name']} already exists")
        else:
            creator_data = {
                "user_id": user_id,
                "display_name": c["name"],
                "handle": c["handle"],
                "title": c["title"],
                "discipline": c["discipline"],
                "location": c["location"],
                "bio": c["bio"],
                "tools": c.get("tools", []),
                "skills": c.get("skills", []),
                "styles": c.get("styles", []),
                "formats": c.get("formats", []),
                "availability": c["availability"],
                "starting_rate": c.get("startingRate", 3000),
                "rate_tier": c.get("rateTier"),
                "response_time": c.get("responseTime", "Within 24h"),
                "avatar_url": c.get("avatar"),
                "cover_url": c.get("coverImage"),
                "socials": c.get("socials", {}),
                "stats": c.get("stats", {"completedProjects": 10, "rating": 4.9, "reviewsCount": 12}),
            }
            res = sb.table("creator_profiles").insert(creator_data).execute()
            c_profile_id = res.data[0]["id"]
            print(f"  Created creator: {c['name']}")

        creator_id_map[c["id"]] = c_profile_id
        creator_id_map[c["handle"]] = c_profile_id

        # Seed Portfolio Items
        if c.get("portfolio"):
            for item in c["portfolio"]:
                port_check = sb.table("portfolio_items").select("id").eq("creator_id", c_profile_id).eq("title", item["title"]).execute()
                if not port_check.data:
                    port_data = {
                        "creator_id": c_profile_id,
                        "title": item["title"],
                        "subtitle": item.get("subtitle"),
                        "type": item.get("type", "Spec Commercial"),
                        "category": item.get("category", "Automotive"),
                        "aspect_ratio": item.get("aspectRatio", "16:9"),
                        "duration": item.get("duration", "0:45"),
                        "badge": item.get("badge"),
                        "client_badge": item.get("clientBadge"),
                        "tools": item.get("tools", []),
                        "workflow": item.get("workflow"),
                        "output": item.get("output"),
                        "media_url": item.get("image"),
                        "thumbnail_url": item.get("image"),
                    }
                    sb.table("portfolio_items").insert(port_data).execute()

    # 3. Seed Campaigns (Briefs)
    print("\n[3/4] Seeding Campaigns & Briefs...")
    campaign_id_map = {}

    for b in briefs:
        code = b.get("code") or f"BRIEF-{b['id'][-4:]}"
        existing = sb.table("campaigns").select("id").eq("code", code).execute()
        if existing.data:
            camp_id = existing.data[0]["id"]
            print(f"  Campaign '{b['title']}' exists")
        else:
            camp_data = {
                "brand_id": brand_id,
                "code": code,
                "title": b["title"],
                "client": b["client"],
                "status": b.get("status", "reviewing"),
                "status_label": b.get("statusLabel"),
                "objective": b["objective"],
                "content_type": b["contentType"],
                "description": b["description"],
                "budget_tier": b.get("budgetTier"),
                "budget_amount": b.get("budgetAmount", 8000),
                "deadline": b.get("deadline", "2025-11-30"),
                "commercial_rights": b.get("commercialRights", "Full Commercial Rights"),
                "commercial_rights_summary": b.get("commercialRightsSummary"),
                "styles": b.get("styles", []),
                "aspect_ratios": b.get("aspectRatios", []),
                "deliverables": b.get("deliverables", []),
                "required_tools": b.get("requiredTools", []),
                "reference_links": b.get("referenceLinks", []),
                "audio_notes": b.get("audioNotes"),
                "proposals_count": b.get("proposalsCount", 0),
            }
            res = sb.table("campaigns").insert(camp_data).execute()
            camp_id = res.data[0]["id"]
            print(f"  Created campaign: '{b['title']}' (code={code})")

        campaign_id_map[b["id"]] = camp_id

    # 4. Seed Shortlists and Invitations / Proposals
    print("\n[4/4] Seeding Shortlists & Proposals...")
    for slug in ["elena-vance", "kaelen-chen", "studio-numen"]:
        cid = creator_id_map.get(slug)
        if cid:
            s_check = sb.table("shortlists").select("id").eq("brand_id", brand_id).eq("creator_id", cid).execute()
            if not s_check.data:
                sb.table("shortlists").insert({"brand_id": brand_id, "creator_id": cid}).execute()
                print(f"  Shortlisted creator {slug}")

    # Seed proposals as invitations
    solaar_camp_id = campaign_id_map.get("brief-solaar-ev")
    if solaar_camp_id:
        for p in proposals:
            cid = creator_id_map.get(p["creatorId"])
            if cid:
                inv_check = sb.table("invitations").select("id").eq("campaign_id", solaar_camp_id).eq("creator_id", cid).execute()
                if not inv_check.data:
                    inv_data = {
                        "campaign_id": solaar_camp_id,
                        "creator_id": cid,
                        "brand_id": brand_id,
                        "status": "pending",
                        "message": f"{p.get('pitchTitle')}: {p.get('summary')}"
                    }
                    sb.table("invitations").insert(inv_data).execute()
                    print(f"  Created invitation proposal from {p.get('creatorName')}")

    print("\n" + "=" * 60)
    print("Database seeding completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    seed_all()