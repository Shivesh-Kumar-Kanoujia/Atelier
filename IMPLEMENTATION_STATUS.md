# Atelier — Implementation Status

## Current Stack
- Frontend: Vanilla JS + Vite SPA (5 views, hash router, localStorage) ✅ COMPLETE
- Backend: FastAPI scaffold ✅ COMPLETE (routes, schemas, matching, auth, AI)
- Database: Schema ready ✅ (schema.sql), NOT DEPLOYED
- Auth: Backend ready ✅, Frontend UI ❌

## Audit: All 19 frontend tests pass. Full mock-data app working.

## Completed
- [x] Frontend MVP (5 screens, all interactions wired)
- [x] Backend API scaffold (FastAPI, all routes, schemas, matching algorithm)
- [x] Database schema (schema.sql with RLS, indexes, triggers)
- [x] Supabase setup guide (backend/SUPABASE_SETUP.md)
- [x] Seed script (backend/seed_database.py)
- [x] Environment files created (backend/.env, .env)
- [x] Dependencies installed

## In Progress
- [ ] Deploy schema to Supabase (run schema.sql in SQL Editor)
- [ ] Create storage bucket 'creator-media'
- [ ] Configure .env with real Supabase keys
- [ ] Seed initial creator data
- [ ] Build Login/Register + Onboarding UI (Phase 2)

## Required Env Vars (Backend - backend/.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key)
SUPABASE_ANON_KEY=eyJ... (anon key)
GROQ_API_KEY=gsk_... (from console.groq.com)
GROQ_MODEL=llama-3.3-70b-versatile
SECRET_KEY=your-32-char-random-string
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development

## Required Env Vars (Frontend - .env)
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (same anon key as backend)

## Next Steps for You (Supabase Setup)

### 1. Create Supabase Project
- Go to https://supabase.com → New Project
- Name: atelier-marketplace (or your choice)
- Save database password

### 2. Run Database Schema
- SQL Editor → New Query
- Paste ENTIRE contents of backend/schema.sql
- Click Run
- Verify in Table Editor: users, creator_profiles, brand_profiles, portfolio_items, campaigns, shortlists, invitations, engagements

### 3. Create Storage Bucket
- Storage → New Bucket
- Name: creator-media
- Public bucket: ✓ checked
- Create

### 4. Get API Keys
- Settings → API
- Copy: Project URL, anon public, service_role (secret!)

### 5. Fill .env Files
- Edit backend/.env with your values
- Edit .env with your values

### 6. Seed Data
```bash
cd backend
python seed_database.py
```

### 7. Test Backend
```bash
cd backend
uvicorn main:app --reload
```
Open http://localhost:8000/docs

### 8. Test Frontend
```bash
npm run dev
```
Open http://localhost:3000

## After Supabase Setup: Phase 2 (Auth UI)
- Build Login/Register views (AuthView.js exists, needs wiring)
- Protected route guards in router.js
- Onboarding wizard: role selection → profile creation
- Token persistence & auto-logout on 401