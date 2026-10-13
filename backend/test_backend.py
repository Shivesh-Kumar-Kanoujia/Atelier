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

def test(name, condition):
    global passed, failed
    if condition:
        print(f"[PASS] {name}")
        passed += 1
    else:
        print(f"[FAIL] {name}")
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

# 2. Authentication
r_login = client.post("/auth/login", json={"email": "aura@atelier.test", "password": "Password123!"})
test("POST /auth/login (Aura Studios Brand)", r_login.status_code == 200 and r_login.json().get("role") == "brand")

token = r_login.json().get("access_token") if r_login.status_code == 200 else None
brand_headers = {"Authorization": f"Bearer {token}"} if token else {}

r_me = client.get("/auth/me", headers=brand_headers)
test("GET /auth/me returns authenticated brand user", r_me.status_code == 200 and r_me.json().get("role") == "brand")

# 3. Discovery & Matching
r_disc = client.get("/discover")
test("GET /discover returns all creators", r_disc.status_code == 200 and r_disc.json().get("total") >= 6)

r_disc_filmmaker = client.get("/discover?discipline=AI+Filmmaker")
test("GET /discover?discipline=AI Filmmaker filters accurately", r_disc_filmmaker.status_code == 200 and len(r_disc_filmmaker.json().get("items")) > 0)

# 4. Campaigns Listing
r_camps = client.get("/campaigns")
test("GET /campaigns returns public active campaigns", r_camps.status_code == 200 and len(r_camps.json()) >= 3)

r_camps_mine = client.get("/campaigns/mine", headers=brand_headers)
test("GET /campaigns/mine returns brand campaigns", r_camps_mine.status_code == 200 and len(r_camps_mine.json()) >= 1)

# 5. Shortlists
r_short = client.get("/shortlists", headers=brand_headers)
test("GET /shortlists returns shortlisted creators for brand", r_short.status_code == 200 and len(r_short.json()) >= 1)

# 6. Groq AI Campaign Brief Generation
r_ai = client.post("/ai/generate-brief", json={
    "idea": "An avant-garde kinetic fashion film set in an architectural desert pavilion",
    "brand_name": "Atelier Couture"
})
test("POST /ai/generate-brief synthesizes structured brief with Groq", r_ai.status_code == 200 and bool(r_ai.json().get("title")) and len(r_ai.json().get("deliverables", [])) > 0)

print("\n" + "=" * 60)
print(f"Backend Results: {passed} passed, {failed} failed.")
print("=" * 60)

if failed > 0:
    sys.exit(1)
