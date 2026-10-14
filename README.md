# Atelier — Computational Cinema & Generative Visual Art Marketplace

An editorial, gallery-grade marketplace connecting world-class AI filmmakers, neural animators, and prompt directors with forward-thinking commercial brands and production studios.

> **Problem Statement**: Proposed by **Kampus.VC**.  
> **Core Roles**: **Creator** (AI directors, prompt cinematographers, neural visual artists) & **Brand / Organization** (studios and companies commissioning high-impact visual campaigns).  
> **Design Philosophy**: Archival forest green (`#0A3525`), warm ivory surface (`#F6FBF5`), muted gold provenance signals (`#D6A66B`), editorial typography (`Playfair Display` & `Plus Jakarta Sans`), and restrained claymorphism card aesthetics.

---

## Table of Contents

- [Core Features & Architecture](#core-features--architecture)
  - [1. Explore Creators Directory](#1-explore-creators-directory-explore)
  - [2. Curated Creator Dossier & Portfolio](#2-curated-creator-dossier--portfolio-profileid)
  - [3. Post a Creative Brief with Groq AI](#3-post-a-creative-brief-with-groq-ai-post-brief)
  - [4. Company Dashboard & Studio Management](#4-company-dashboard--studio-management-dashboard)
  - [5. Brief Detail, Explainable Recommendations & Tender Deck](#5-brief-detail-explainable-recommendations--tender-deck-briefid)
  - [6. Creator Studio & Portfolio Manager](#6-creator-studio--portfolio-manager-creator-dashboard)
  - [7. Role-Specific Onboarding](#7-role-specific-onboarding-onboarding-creator--onboarding-brand)
  - [8. Top Navigation & Authentication System](#8-top-navigation--authentication-system)
- [Explainable AI Recommendation Engine](#explainable-ai-recommendation-engine)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Local Setup & Development](#local-setup--development)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Database Seeding](#database-seeding)
- [Automated Testing & Verification](#automated-testing--verification)
- [API Reference](#api-reference)

---

## Core Features & Architecture

### 1. Explore Creators Directory (`#explore`)
- **Multi-Faceted Filtering**: Filter curated creators by:
  - **Discipline**: AI Filmmaker, 3D & Neural Animator, Concept Artist, Visual Effects, Motion Designer, Sound Designer.
  - **AI Tools & Models**: Runway Gen-3, Midjourney v6, Flux.1 Pro, ComfyUI, Kling, Luma Dream Machine, Topaz Video AI, TouchDesigner, Blender.
  - **Aesthetic Styles**: Cinematic 35mm, Editorial Fashion, Photorealistic Automotive, Surreal Worldbuilding, Retro & Analog, Minimalist Architecture.
  - **Availability**: Available Now, Available in 2 Weeks, Booking Next Month.
- **Real-Time Search**: Instant multi-attribute search matching creator names, disciplines, prompt focus, tools, and biographies.
- **Sorting Modes**: Sort roster by *Recommended*, *Starting Rate: Low to High*, *Starting Rate: High to Low*, and *Top Rated*.
- **Shortlist Bookmarking**: One-click talent bookmarking synced reactively to the Company Dashboard with feedback toasts.
- **Refined Header**: Clean, uncluttered editorial discovery bar with live roster availability status.

### 2. Curated Creator Dossier & Portfolio (`#profile/:id`)
- **Visual Representation**: Verified artist badges, geographic location, commercial starting day rate, and response turnaround SLA (<24h).
- **Verified Statistics**: Completed commercial projects, client satisfaction rating (e.g., 4.98/5), and review counts.
- **Technical Pipeline Matrix**: Explicit breakdowns of generative AI models, render pipelines, and post-production software.
- **Filterable Media Gallery**: Categorized portfolio works (*Commercial Spots*, *Spec Work*, *Short Films*) with simulated 4K reels and step-by-step prompt-to-render workflow breakdowns.
- **Collaborator Testimonials**: Provenance quotes and credentials from commissioning creative directors.
- **Commission Packages**: Tiered commercial offerings (*Starter Teaser*, *Full Campaign Spot*, *Bespoke Narrative Production*) with an interactive direct inquiry modal.

### 3. Post a Creative Brief with Groq AI (`#post-brief`)
- **3-Step Structured Wizard**:
  - **Step 1: Scope & Purpose**: Title, brand name, campaign objective, content type, narrative guidelines.
  - **Step 2: Visual Style & References**: Interactive style cards selector, reference links manager, aspect ratio chips (16:9, 9:16, 2.39:1).
  - **Step 3: Deliverables & Terms**: 4K master, social cutdowns, clean stills, generation logs, target deadline, commercial budget tiers ($1K–$3K, $3K–$6K, $6K–$12K, $12K+), licensing options.
- **Groq AI Brief Assistant (`openai/gpt-oss-120b`)**:
  - Automatically synthesizes complete briefs from natural language prompts.
  - Populates title, narrative scope, recommended tools, aesthetic styles, deliverables, and budgets with resilient JSON extraction and preflight validation.
- **Reactive Sticky Preview**: Live brief specification card updating in real time with an estimated match score.
- **Instant Publication**: Immediately publishes briefs to the active marketplace pipeline with local draft autosave.

### 4. Company Dashboard & Studio Management (`#dashboard`)
- **Live Studio KPI Strip**: Real-time counters for *Active Briefs*, *Proposals Received*, *Shortlisted Talent*, and *Allocated Budget*.
- **Brand Organization Identity**:
  - Upload, preview, replace, or remove brand logos with Supabase Storage integration (`creator-media/logos/`).
  - Fallback organization logo with initials on ivory/gold styling.
- **Active Briefs Pipeline**: Full management of campaign briefs (`Solaar EV`, `Heritage Botanicals`, `Synthetica Sound`, and user-published briefs) with production status badges (`reviewing`, `in_production`, `completed`).
- **Shortlisted Talent Drawer**: Direct access to bookmarked creators with instant profile routing and direct invitation shortcuts.

### 5. Brief Detail, Explainable Recommendations & Tender Deck (`#brief/:id`)
- **Comprehensive Brief Dossier**: High-resolution reference stills gallery, technical deliverables checklist, and audio design parameters.
- **Explainable AI Matching Algorithm**:
  - Calculates transparent match percentages based on a 5-factor scoring model:
    - **Skills Match**: 35%
    - **Content Type Match**: 25%
    - **AI Tools & Models Match**: 20%
    - **Output Format Match**: 10%
    - **Availability Match**: 10%
  - Explanatory tags explaining *why* each artist matches (*Matching Tools*, *Matching Style*, *Format Fit*, *Immediate Availability*).
- **Tender Administration**:
  - Review director treatments submitted by creators (Elena Vance, Kaelen Chen, Studio Numen) with turnaround schedules, quoted fees, and mood reels.
  - Filter treatments between all pitches and shortlisted pitches.
  - **Accept Proposal Workflow**: Assigns creator, approves budget, and transitions the brief into active `in_production` status.

### 6. Creator Studio & Portfolio Manager (`#creator-dashboard`)
- **Studio Representation Dossier**:
  - Edit display name, handle, title, bio, discipline, tools, skills, location, availability, and commercial day rate.
- **Avatar Upload & Media Management**:
  - Real file picker supporting JPG, PNG, WebP with live preview.
  - Uploads to Supabase Storage bucket `creator-media/avatars/{user_id}/...`.
  - Persists public URL to database and syncs instantly across the application without requiring re-login.
- **Portfolio Works Management**:
  - Upload binary media (images, video clips) up to 15MB.
  - Add work title, category, production year, tool chain, prompt workflow, and client badge.
  - Delete portfolio items with automated storage file cleanup.
- **Commercial Invitations Pipeline**:
  - View incoming brand project invitations with live *Accept Pitch* and *Decline* controls.
- **Active Engagements**: Track commissioned project timelines and mark deliverables as complete.

### 7. Role-Specific Onboarding (`#onboarding-creator` & `#onboarding-brand`)
- **Creator Onboarding**: Select primary AI tools (Runway, Midjourney, ComfyUI, Flux, Kling), aesthetic styles, commercial day rate, and narrative bio.
- **Brand Onboarding**: Set organization name, industry specialization, website, and commercial project scope.

### 8. Top Navigation & Authentication System
- **Role-Based Authentication**:
  - Register as either a **Creator** or **Brand / Organization**.
  - Adaptive API base with automatic fallback between `localhost` and `127.0.0.1` on any local port.
  - Resilient local session fallback ensuring seamless development flow even if the backend is temporarily offline.
- **Authenticated Profile Avatar**:
  - Top-right navigation displays the authenticated user's circular (38px) profile picture or brand logo.
  - Polished fallback avatar displaying user initials on archival forest green (`#0A3525`) with a gold border when no photo is uploaded.
  - Preserves role badges (`Creator` / `Brand / Org`) and logout button.
  - Accessible tooltip (`title="${userName}"`) and screen-reader label (`aria-label="Profile of ${userName}"`).
  - Subtle hover animation (scale 1.05, forest-green border, gold halo).
  - Syncs reactively on avatar upload or logo change without requiring page refresh.

---

## Explainable AI Recommendation Engine

Atelier does not treat creator recommendations as a black box. Matching weights are clearly calibrated to commercial production realities:

$$\text{Match Score} = 0.35 \times S_{\text{skills}} + 0.25 \times S_{\text{content}} + 0.20 \times S_{\text{tools}} + 0.10 \times S_{\text{format}} + 0.10 \times S_{\text{avail}}$$

Each recommendation exposes transparent breakdown tags:
- **Matching Tools**: Exact intersection of generative models required by the brief and mastered by the creator.
- **Style Alignment**: Verification that the creator's portfolio demonstrates the required aesthetic (e.g., *Cinematic 35mm* or *Photorealistic Automotive*).
- **Format Delivery**: Compatibility with target aspect ratio and resolution (e.g., *16:9 • 4K ProRes*).
- **Availability Fit**: Instant confirmation of the creator's current cohort opening.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Vanilla JavaScript (ES Modules), HTML5 |
| **Styling & Design System** | Vanilla CSS3 (Custom Design Tokens, Claymorphism, Mobile-Responsive Grid) |
| **Build & Bundler** | [Vite 6](https://vitejs.dev/) |
| **Icons & Typography** | Google Material Symbols, Playfair Display, Plus Jakarta Sans |
| **State Management** | Central Reactive Store (`src/data/store.js`) with Event-Driven Subscribers & `localStorage` Persistence |
| **Client Router** | Hash-based SPA Router (`src/router.js`) supporting direct deep links |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL Database, Supabase Auth, Storage) |
| **Media Storage** | Supabase Storage (`creator-media` bucket with MIME and size validation) |
| **Generative AI** | [Groq](https://groq.com/) API (`openai/gpt-oss-120b`) for rapid brief synthesis |
| **Testing** | Node.js Automated Test Suite (`test_app.js`) & Python Test Suite (`backend/test_backend.py`) |

---

## Repository Structure

```
hacXLerate-/
├── index.html                    # Main SPA entry point
├── package.json                  # Vite build configuration and scripts
├── test_app.js                   # Automated frontend architecture test suite (39 tests)
├── IMPLEMENTATION_STATUS.md      # Detailed verification and audit report
├── README.md                     # Project documentation
│
├── src/                          # Frontend Source Code
│   ├── main.js                   # Client initialization and bootloader
│   ├── router.js                 # Hash-based client router
│   ├── api.js                    # API client with adaptive fallback & auth management
│   │
│   ├── components/               # Universal UI Components
│   │   ├── Header.js             # Global header with dynamic avatar & tagline refinement
│   │   ├── Footer.js             # Global footer with Kampus.VC attribution
│   │   ├── Modal.js              # Accessible modal with scroll-lock restoration
│   │   └── Toast.js              # Non-blocking reactive notifications
│   │
│   ├── data/                     # Seed Data & Central Reactive Store
│   │   ├── store.js              # Reactive state store & subscription hub
│   │   ├── creators.js           # Curated AI creator dossiers & portfolio items
│   │   ├── briefs.js             # Seeded creative briefs & deliverables
│   │   └── proposals.js          # Seeded director treatments & bids
│   │
│   ├── styles/                   # Atelier Design System
│   │   ├── theme.css             # Theme variables (forest green, ivory, gold tokens)
│   │   └── components.css        # Buttons, cards, modals, avatar, navigation styles
│   │
│   └── views/                    # Application Views
│       ├── ExploreCreatorsView.js   # Screen 1: Discovery, multi-facet filtering & search
│       ├── CreatorProfileView.js    # Screen 2: Creator dossier, reel player & packages
│       ├── PostBriefView.js         # Screen 3: 3-step brief wizard + Groq AI assistant
│       ├── CompanyDashboardView.js  # Screen 4: Brand studio KPIs, logo upload & pipeline
│       ├── BriefDetailView.js       # Screen 5: Explainable matching & treatment tender deck
│       ├── CreatorDashboardView.js  # Screen 6: Creator Studio, avatar & portfolio manager
│       ├── AuthView.js              # Screen 7: Role-based registration & login
│       └── OnboardingView.js        # Screen 8: Creator & brand onboarding flows
│
└── backend/                      # FastAPI Backend
    ├── main.py                   # FastAPI application & CORS configuration
    ├── config.py                 # Pydantic environment settings
    ├── database.py               # Supabase client singleton (admin & anon keys)
    ├── auth.py                   # Supabase authentication service
    ├── schemas.py                # Pydantic request & response models
    ├── groq_service.py           # Groq AI structured brief generator
    ├── seed_database.py          # Database seeder script
    ├── seed_data.json            # Initial dataset for Supabase
    ├── test_backend.py           # Backend automated test suite (29 tests)
    └── routes/                   # API Route Handlers
        ├── auth_routes.py        # /auth/register, /auth/login, /auth/logout, /auth/me
        ├── profile_routes.py     # /profiles (creator/brand profiles, avatar & logo upload)
        ├── portfolio_routes.py   # /portfolio (CRUD works & media upload)
        ├── campaign_routes.py    # /campaigns (briefs CRUD, publish, close)
        ├── discover_routes.py    # /discover (search & filter creators)
        ├── collab_routes.py      # /shortlists, /invitations, /engagements
        └── ai_routes.py          # /ai/generate-brief (Groq synthesis)
```

---

## Local Setup & Development

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **Python** (v3.10 or higher)
- **Supabase Account** (or existing `.env` configuration)

### Frontend Setup

```bash
# Navigate to repository
cd hacXLerate-

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will run at **`http://localhost:3000/`**.

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --port 8000 --reload
```

The API documentation will be available at **`http://localhost:8000/docs`**.

### Environment Variables

Configure `backend/.env` with your Supabase and Groq credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b
SECRET_KEY=your-secret-key-for-jwt
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

### Database Seeding

Populate the database with curated creators, active creative briefs, and director treatments:

```bash
cd backend
python seed_database.py
```

---

## Automated Testing & Verification

Atelier includes comprehensive test suites across both the frontend and backend.

### Frontend Test Suite (39 Tests)
Tests state reactivity, view rendering, tagline removal, authenticated avatar rendering, fallback initials, and proposal acceptance workflows:

```bash
node test_app.js
```
```
=== Testing Atelier Marketplace Architecture ===
✓ Loaded 6 creators (expected 6)
✓ Elena Vance profile is accessible
✓ Elena has 4 portfolio items
✓ Elena has 3 commission packages
✓ Loaded 4 briefs (expected at least 4)
✓ Solaar EV brief is accessible
✓ Elena Vance match score is 97% (expected >= 95%)
✓ Match has 4 explainability breakdown factors
✓ Breakdown specifies matching tools: Matching Tools: Runway Gen-3, ComfyUI, Topaz Video AI
✓ Bookmark toggle works reactively
✓ Screen 1 (Explore Creators) renders successfully
✓ Tagline eyebrow is removed from Explore Creators view
✓ Screen 2 (Creator Profile) renders successfully
✓ Screen 3 (Post a Brief) renders successfully
✓ Screen 4 (Company Dashboard) renders successfully
✓ Screen 5 (Brief Detail with Recommendations) renders successfully
✓ Header includes Atelier brand and tagline is completely removed
✓ Footer includes tagline and Kampus.VC problem statement attribution
✓ Header displays authenticated creator profile picture
✓ Header provides accessible tooltip and label with user name
✓ Header preserves Creator role badge
✓ Header preserves logout button and replaces visible text name with avatar
✓ Header displays authenticated brand profile picture / logo
✓ Header preserves Brand / Org role badge
✓ Header provides accessible label for brand user
✓ Header displays polished fallback avatar with initials (AS) when no image exists
✓ Initials helper computes AS correctly for Amay Sharma
✓ Initials helper computes EV correctly for Elena Vance
✓ Header renders guest auth CTA when not logged in
✓ AuthView renders login and registration with both roles
✓ CreatorDashboardView renders studio panels
✓ Creator Onboarding renders correctly
✓ Brand Onboarding renders correctly
✓ Dynamic brief publication persists in store
✓ Proposal acceptance executes cleanly
✓ Brief status updated to in_production upon accepting proposal
✓ Creator avatar updates reactively in store
✓ New portfolio item found in creator portfolio
✓ Removed portfolio item no longer in creator portfolio

Results: 39 passed, 0 failed.
```

### Backend Test Suite (29 Tests)
Tests API endpoints, authentication guards, role permissions, binary media uploads to Supabase Storage, and Groq brief generation:

```bash
python backend/test_backend.py
```
```
Results: 29 passed, 0 failed.
```

### Production Build
Validate that the production bundle builds without errors:

```bash
npm run build
```

---

## API Reference

### Authentication (`/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new Creator or Brand user |
| `POST` | `/auth/login` | Authenticate user and receive JWT bearer token |
| `POST` | `/auth/logout` | Terminate active session |
| `GET` | `/auth/me` | Fetch authenticated user identity and role |

### Profiles & Media (`/profiles`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profiles/creator/me` | Get authenticated creator's profile |
| `POST` | `/profiles/creator` | Create initial creator profile (onboarding) |
| `PATCH` | `/profiles/creator/me` | Update creator metadata, day rates, and tools |
| `POST` | `/profiles/creator/me/avatar` | Upload profile avatar to Supabase Storage |
| `DELETE` | `/profiles/creator/me/avatar` | Remove creator avatar |
| `GET` | `/profiles/brand/me` | Get authenticated brand's organization profile |
| `POST` | `/profiles/brand` | Create initial brand profile (onboarding) |
| `PATCH` | `/profiles/brand/me` | Update brand company information |
| `POST` | `/profiles/brand/me/logo` | Upload brand organization logo to Supabase Storage |
| `DELETE` | `/profiles/brand/me/logo` | Remove brand logo |

### Portfolio Works (`/portfolio`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/portfolio/mine` | List portfolio works of authenticated creator |
| `POST` | `/portfolio` | Add new portfolio item to creator dossier |
| `PATCH` | `/portfolio/{id}` | Update portfolio item metadata |
| `DELETE` | `/portfolio/{id}` | Delete portfolio item and remove storage files |
| `POST` | `/portfolio/{id}/media` | Upload binary video/image to portfolio item |

### Campaigns & Briefs (`/campaigns`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/campaigns` | List active commercial briefs |
| `GET` | `/campaigns/mine` | List briefs published by authenticated brand |
| `GET` | `/campaigns/{id}` | Get brief details and deliverables |
| `POST` | `/campaigns` | Create and publish a new campaign brief |
| `PATCH` | `/campaigns/{id}` | Update existing brief parameters |
| `POST` | `/campaigns/{id}/close` | Mark brief as completed or closed |

### Collaborations & Matching (`/discover`, `/shortlists`, `/invitations`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/discover` | Search and filter creator roster |
| `GET` | `/shortlists` | Get shortlisted creators for authenticated brand |
| `POST` | `/shortlists/{id}/toggle` | Toggle creator bookmark on shortlist |
| `GET` | `/invitations/mine` | Get incoming/outgoing brief invitations |
| `POST` | `/invitations` | Invite a creator to pitch on a campaign brief |
| `PATCH` | `/invitations/{id}/respond` | Accept or decline a pitch invitation |
| `POST` | `/ai/generate-brief` | Synthesize complete creative brief via Groq AI |

---

## License

© 2025 ATELIER INC. All rights reserved. Problem statement proposed by **Kampus.VC**.
