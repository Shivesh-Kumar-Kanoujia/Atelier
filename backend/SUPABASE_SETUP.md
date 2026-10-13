# Atelier Backend - Supabase Setup Guide

## Prerequisites
- Supabase account (free tier works)
- Groq API key for AI brief generation (free at console.groq.com)

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Choose a name (e.g., "atelier-marketplace")
3. Set a database password (save it!)
4. Select region closest to your users
5. Wait for project to provision (~2 minutes)

---

## Step 2: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor** → **New Query**
2. Copy the ENTIRE contents of `backend/schema.sql` and paste it
3. Click **Run** (or Cmd/Ctrl + Enter)
4. Verify all tables created: go to **Table Editor** and confirm these exist:
   - `users`
   - `creator_profiles`
   - `brand_profiles`
   - `portfolio_items`
   - `campaigns`
   - `shortlists`
   - `invitations`
   - `engagements`

---

## Step 3: Create Storage Bucket

1. Go to **Storage** in left sidebar
2. Click **New Bucket**
3. Name: `creator-media`
4. **Public bucket**: ✓ Check this
5. Click **Create bucket**
6. (Optional) Set file size limit: 10MB

---

## Step 4: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` (both backend and frontend)
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (backend only - keep secret!)

---

## Step 5: Configure Environment Variables

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx  # From console.groq.com
GROQ_MODEL=llama-3.3-70b-versatile
SECRET_KEY=your-32-char-random-string-here
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 6: Seed Initial Data

```bash
cd backend
python seed_database.py
```

This creates 6 creators with portfolio items in the database.

---

## Step 7: Verify Backend Runs

```bash
cd backend
uvicorn main:app --reload
```

Open http://localhost:8000/docs - you should see the Swagger UI with all endpoints.

---

## Step 8: Run Frontend

```bash
npm run dev
```

Open http://localhost:3000

---

## Step 9: Test Full Flow

1. **Register as Brand**: Click "Sign Up" → choose "Brand" → complete onboarding
2. **Post a Brief**: Use the 3-step wizard → publish
3. **Register as Creator**: (in incognito/new browser) → choose "Creator" → complete profile
4. **Explore**: See creators with real data from database
5. **Dashboard**: Brand sees brief, creator sees invitations

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set` | Check backend/.env has correct values, no extra spaces |
| `relation "creator_profiles" does not exist` | Run schema.sql in SQL Editor |
| `new row violates row-level security policy` | Ensure RLS policies in schema.sql ran correctly |
| CORS errors | Verify FRONTEND_URL in backend/.env matches your frontend origin |
| AI brief generation fails | Verify GROQ_API_KEY is valid at console.groq.com |

---

## Useful Supabase Dashboard Links

- **Table Editor**: View/edit data directly
- **Authentication → Users**: See registered users
- **Storage → creator-media**: View uploaded avatars/portfolio media
- **Logs → API Logs**: Debug failed requests
- **SQL Editor**: Run ad-hoc queries

---

## RLS Policy Notes

The schema includes Row Level Security policies:
- **Public read**: creator_profiles, brand_profiles, portfolio_items, campaigns (published+)
- **Own write**: Users can only modify their own profiles/campaigns
- **Brand own**: shortlists, invitations (brand side)
- **Creator own**: portfolio_items, invitations (creator side), engagements

Test these work by registering two accounts (brand + creator) and verifying isolation.