#!/usr/bin/env python3
"""
Backend automated test suite for Atelier FastAPI API.
Tests Authentication, Profiles, Portfolios, Campaigns, Discover, Shortlists, Invitations, and AI Brief Generation.
"""
import sys
import os
from fastapi.testclient import TestClient
from dotenv import load_dotenv

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

import main

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

client = TestClient(main.app)

passed = 0
failed = 0

def test(name, condition, detail=""):
    global passed, failed
    if condition:
        print(f"[PASS] {name}")
        passed += 1
    else:
        err_msg = f" - {detail}" if detail else ""
        print(f"[FAIL] {name}{err_msg}")
        failed += 1

print("=" * 60)
print("Testing Atelier Backend Architecture & Services")
print("Where AI Creativity Meets Brands — Kampus.VC Problem Statement")
print("=" * 60)

# 1. Health & Root
r_health = client.get("/health")
test("GET /health returns 200 healthy", r_health.status_code == 200 and r_health.json().get("status") == "healthy")

r_root = client.get("/")
test("GET / returns 200 Atelier API", r_root.status_code == 200 and "Atelier" in r_root.json().get("product", ""))

# 2. Authentication (Brand & Creator)
r_login_brand = client.post("/auth/login", json={"email": "aura@atelier.test", "password": "Password123!"})
test("POST /auth/login (Aura Studios Brand)", r_login_brand.status_code == 200 and r_login_brand.json().get("role") == "brand")

brand_token = r_login_brand.json().get("access_token") if r_login_brand.status_code == 200 else None
brand_headers = {"Authorization": f"Bearer {brand_token}"} if brand_token else {}

r_login_creator = client.post("/auth/login", json={"email": "elena-vance@atelier.test", "password": "Password123!"})
test("POST /auth/login (Elena Vance Creator)", r_login_creator.status_code == 200 and r_login_creator.json().get("role") == "creator")

creator_token = r_login_creator.json().get("access_token") if r_login_creator.status_code == 200 else None
creator_headers = {"Authorization": f"Bearer {creator_token}"} if creator_token else {}

r_me_brand = client.get("/auth/me", headers=brand_headers)
test("GET /auth/me returns authenticated brand user", r_me_brand.status_code == 200 and r_me_brand.json().get("role") == "brand")

r_me_creator = client.get("/auth/me", headers=creator_headers)
test("GET /auth/me returns authenticated creator user", r_me_creator.status_code == 200 and r_me_creator.json().get("role") == "creator")

# 3. Security & Role Isolation
r_unauth_me = client.get("/auth/me")
test("GET /auth/me rejects unauthenticated request (401)", r_unauth_me.status_code == 401)

r_unauth_invites = client.get("/invitations/mine")
test("GET /invitations/mine rejects unauthenticated request (401)", r_unauth_invites.status_code == 401)

r_unauth_portfolio = client.get("/portfolio/mine")
test("GET /portfolio/mine rejects unauthenticated request (401)", r_unauth_portfolio.status_code == 401)

# Brand attempting creator-only endpoint
r_brand_as_creator = client.post("/profiles/creator/me/avatar", files={"file": ("test.png", b"test", "image/png")}, headers=brand_headers)
test("Brand rejected from creator avatar endpoint (403)", r_brand_as_creator.status_code == 403)

# Creator attempting brand-only endpoint
r_creator_as_brand = client.post("/profiles/brand/me/logo", files={"file": ("test.png", b"test", "image/png")}, headers=creator_headers)
test("Creator rejected from brand logo endpoint (403)", r_creator_as_brand.status_code == 403)

# 4. Discovery & Matching
r_disc = client.get("/discover")
test("GET /discover returns all creators", r_disc.status_code == 200 and r_disc.json().get("total") >= 6)

r_disc_filmmaker = client.get("/discover?discipline=AI+Filmmaker")
test("GET /discover?discipline=AI Filmmaker filters accurately", r_disc_filmmaker.status_code == 200 and len(r_disc_filmmaker.json().get("items")) > 0)

# 5. Campaigns Listing
r_camps = client.get("/campaigns")
test("GET /campaigns returns public active campaigns", r_camps.status_code == 200 and len(r_camps.json()) >= 3)

r_camps_mine = client.get("/campaigns/mine", headers=brand_headers)
test("GET /campaigns/mine returns brand campaigns", r_camps_mine.status_code == 200 and len(r_camps_mine.json()) >= 1)

# 6. Shortlists
r_short = client.get("/shortlists", headers=brand_headers)
test("GET /shortlists returns shortlisted creators for brand", r_short.status_code == 200 and len(r_short.json()) >= 1)

# 7. Invitations (Brand & Creator)
r_invites_creator = client.get("/invitations/mine", headers=creator_headers)
test("GET /invitations/mine returns invitations for creator", r_invites_creator.status_code == 200 and isinstance(r_invites_creator.json(), list))

r_invites_brand = client.get("/invitations/mine", headers=brand_headers)
test("GET /invitations/mine returns invitations sent by brand", r_invites_brand.status_code == 200 and isinstance(r_invites_brand.json(), list))

# 8. Media File Validation & Storage Security
import io

# Reject non-image MIME types
text_file = io.BytesIO(b"Plain text file content, not an image.")
r_val_type = client.post(
    "/profiles/creator/me/avatar",
    files={"file": ("malicious.txt", text_file, "text/plain")},
    headers=creator_headers
)
test("POST avatar rejects non-image MIME type (422)", r_val_type.status_code == 422)

# Reject oversized file (> 10MB)
huge_file = io.BytesIO(b"0" * (11 * 1024 * 1024))
r_val_size = client.post(
    "/profiles/creator/me/avatar",
    files={"file": ("huge.png", huge_file, "image/png")},
    headers=creator_headers
)
test("POST avatar rejects file exceeding 10MB limit (413)", r_val_size.status_code == 413)

# 9. Real Media Upload & Profile Persistence (Supabase Storage)
tiny_gif = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'

# Creator Avatar Upload & Deletion
r_upload_avatar = client.post(
    "/profiles/creator/me/avatar",
    files={"file": ("avatar.gif", io.BytesIO(tiny_gif), "image/gif")},
    headers=creator_headers
)
test("POST /profiles/creator/me/avatar uploads real binary file to Supabase Storage", 
     r_upload_avatar.status_code == 200 and "creator-media/avatars" in r_upload_avatar.json().get("avatar_url", ""))

r_delete_avatar = client.delete("/profiles/creator/me/avatar", headers=creator_headers)
test("DELETE /profiles/creator/me/avatar clears avatar and returns null", 
     r_delete_avatar.status_code == 200 and r_delete_avatar.json().get("avatar_url") is None)

# Brand Logo Upload & Deletion
r_upload_logo = client.post(
    "/profiles/brand/me/logo",
    files={"file": ("logo.gif", io.BytesIO(tiny_gif), "image/gif")},
    headers=brand_headers
)
test("POST /profiles/brand/me/logo uploads real binary file to Supabase Storage", 
     r_upload_logo.status_code == 200 and "creator-media/logos" in r_upload_logo.json().get("logo_url", ""))

r_delete_logo = client.delete("/profiles/brand/me/logo", headers=brand_headers)
test("DELETE /profiles/brand/me/logo clears logo and returns null", 
     r_delete_logo.status_code == 200 and r_delete_logo.json().get("logo_url") is None)

# 10. Creator Portfolio System & Media Attachment
r_port_mine = client.get("/portfolio/mine", headers=creator_headers)
test("GET /portfolio/mine returns portfolio items for creator", r_port_mine.status_code == 200 and isinstance(r_port_mine.json(), list))

# Create portfolio item
r_port_create = client.post(
    "/portfolio",
    json={"title": "Automated Test Film Still", "category": "AI Filmmaking", "year": "2025"},
    headers=creator_headers
)
test("POST /portfolio creates new portfolio work", r_port_create.status_code == 201 and "id" in r_port_create.json())

if r_port_create.status_code == 201:
    item_id = r_port_create.json()["id"]
    
    # Upload binary media to portfolio item
    r_port_media = client.post(
        f"/portfolio/{item_id}/media",
        files={"file": ("still.gif", io.BytesIO(tiny_gif), "image/gif")},
        headers=creator_headers
    )
    test("POST /portfolio/{id}/media uploads asset to Supabase creator-media", 
         r_port_media.status_code == 200 and "creator-media/portfolio" in r_port_media.json().get("media_url", ""))
    
    # Delete portfolio item
    r_port_del = client.delete(f"/portfolio/{item_id}", headers=creator_headers)
    test("DELETE /portfolio/{id} removes portfolio work (204)", r_port_del.status_code == 204)

# 11. Groq AI Campaign Brief Generation
r_ai = client.post("/ai/generate-brief", json={
    "idea": "An avant-garde kinetic fashion film set in an architectural desert pavilion",
    "brand_name": "Atelier Couture"
})
ai_ok = r_ai.status_code == 200 and bool(r_ai.json().get("title")) and len(r_ai.json().get("deliverables", [])) > 0
test(
    "POST /ai/generate-brief synthesizes structured brief with Groq",
    ai_ok,
    detail=f"status={r_ai.status_code}, body={repr(r_ai.text)[:200]}"
)

print("\n" + "=" * 60)
print(f"Backend Results: {passed} passed, {failed} failed.")
print("=" * 60)

if failed > 0:
    sys.exit(1)
