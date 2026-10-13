#!/usr/bin/env python3
"""
Seed script to populate Supabase with initial Atelier creator data.
Run this AFTER creating the Supabase project and running schema.sql in SQL Editor.

Usage:
1. Create Supabase project at https://supabase.com
2. Run schema.sql in SQL Editor
3. Create storage bucket 'creator-media' (public)
4. Fill in backend/.env with your Supabase credentials
5. Run: python seed_database.py
"""
import os
import sys
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

# Import creator data
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'data'))
from creators import INITIAL_CREATORS

sb = get_supabase()

def seed_creators():
    print("Seeding creators...")
    for creator in INITIAL_CREATORS:
        # Check if creator already exists
        existing = sb.table("creator_profiles").select("id").eq("id", creator["id"]).maybe_single().execute()
        if existing.data:
            print(f"  Creator {creator['name']} already exists, skipping")
            continue
        
        # Prepare data for creator_profiles table
        creator_data = {
            "id": creator["id"],
            "user_id": creator["id"],  # Using same ID for simplicity in seed
            "display_name": creator["name"],
            "handle": creator["handle"],
            "title": creator["title"],
            "discipline": creator["discipline"],
            "location": creator["location"],
            "bio": creator["bio"],
            "tools": creator["tools"],
            "skills": creator["skills"],
            "styles": creator["styles"],
            "formats": creator["formats"],
            "availability": creator["availability"],
            "starting_rate": creator["startingRate"],
            "rate_tier": creator["rateTier"],
            "response_time": creator["responseTime"],
            "avatar_url": creator["avatar"],
            "cover_url": creator["coverImage"],
            "socials": creator["socials"],
            "stats": creator["stats"],
        }
        
        try:
            result = sb.table("creator_profiles").insert(creator_data).execute()
            print(f"  ✓ Created creator: {creator['name']}")
            
            # Seed portfolio items
            if creator.get("portfolio"):
                for item in creator["portfolio"]:
                    portfolio_data = {
                        "creator_id": creator["id"],
                        "title": item["title"],
                        "subtitle": item.get("subtitle"),
                        "type": item.get("type"),
                        "category": item.get("category"),
                        "aspect_ratio": item.get("aspectRatio"),
                        "duration": item.get("duration"),
                        "badge": item.get("badge"),
                        "client_badge": item.get("clientBadge"),
                        "tools": item.get("tools", []),
                        "workflow": item.get("workflow"),
                        "output": item.get("output"),
                        "media_url": item.get("image"),
                        "thumbnail_url": item.get("image"),
                    }
                    sb.table("portfolio_items").insert(portfolio_data).execute()
                print(f"    ✓ Added {len(creator['portfolio'])} portfolio items")
                
        except Exception as e:
            print(f"  ✗ Failed to create creator {creator['name']}: {e}")

def seed_briefs():
    print("\nSeeding briefs...")
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'data'))
    from briefs import INITIAL_BRIEFS
    
    for brief in INITIAL_BRIEFS:
        existing = sb.table("campaigns").select("id").eq("id", brief["id"]).maybe_single().execute()
        if existing.data:
            print(f"  Brief {brief['title']} already exists, skipping")
            continue
        
        # Need a brand_id - use first creator's user_id as placeholder
        brand_result = sb.table("brand_profiles").select("id").limit(1).execute()
        if not brand_result.data:
            print("  No brand profiles exist. Create a brand profile first.")
            continue
        brand_id = brand_result.data[0]["id"]
        
        brief_data = {
            "id": brief["id"],
            "brand_id": brand_id,
            "code": brief.get("code", f"BRIEF-{brief['id'][-4:]}"),
            "title": brief["title"],
            "client": brief["client"],
            "status": brief["status"],
            "status_label": brief.get("statusLabel"),
            "objective": brief["objective"],
            "content_type": brief["contentType"],
            "description": brief["description"],
            "budget_tier": brief.get("budgetTier"),
            "budget_amount": brief.get("budgetAmount"),
            "deadline": brief.get("deadline"),
            "commercial_rights": brief.get("commercialRights"),
            "commercial_rights_summary": brief.get("commercialRightsSummary"),
            "styles": brief.get("styles", []),
            "aspect_ratios": brief.get("aspectRatios", []),
            "deliverables": brief.get("deliverables", []),
            "required_tools": brief.get("requiredTools", []),
            "reference_links": brief.get("referenceLinks", []),
            "audio_notes": brief.get("audioNotes"),
            "proposals_count": brief.get("proposalsCount", 0),
            "assigned_creator_id": brief.get("assignedCreatorId"),
        }
        
        try:
            sb.table("campaigns").insert(brief_data).execute()
            print(f"  ✓ Created brief: {brief['title']}")
        except Exception as e:
            print(f"  ✗ Failed to create brief {brief['title']}: {e}")

def seed_proposals():
    print("\nSeeding proposals...")
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'data'))
    from proposals import INITIAL_PROPOSALS
    
    for proposal in INITIAL_PROPOSALS:
        existing = sb.table("invitations").select("id").eq("id", proposal["id"]).maybe_single().execute()
        # Proposals are stored as invitations with treatments
        # For now just print - proposals are linked to campaigns via invitation system
        pass
    print("  Proposals are handled via invitation/treatment system")

if __name__ == "__main__":
    print("=" * 50)
    print("Atelier Database Seed Script")
    print("=" * 50)
    
    seed_creators()
    seed_briefs()
    seed_proposals()
    
    print("\n" + "=" * 50)
    print("Seeding complete!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Create a brand profile via the frontend (register as brand)")
    print("2. Test the API at http://localhost:8000/docs")
    print("3. Run frontend: npm run dev")