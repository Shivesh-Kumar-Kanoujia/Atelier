# Atelier — Where AI Creativity Meets Brands

An editorial, gallery-grade computational cinema and generative visual art marketplace connecting world-class AI filmmakers, prompt directors, and creators with innovative commercial brands and organizations. 

> **Problem Statement**: Proposed by **Kampus.VC**.
> **Core Roles**: **Creator** (AI filmmakers, animators, prompt directors) and **Brand / Organization** (companies commissioning high-impact visual campaigns).
> **Aesthetic System**: Archival forest green (`#0A3525`), warm ivory background (`#F6FBF5`), muted gold provenance signals (`#D6A66B`), editorial typography (`Playfair Display` & `Plus Jakarta Sans`), and restrained claymorphism cards.

---

## Core MVP Screens

1. **Explore Creators (`#explore`)**
   - Live roster discovery with multi-faceted filtering:
     - **Discipline**: AI Filmmaker, 3D & Neural Animator, Concept Artist, Visual Effects
     - **AI Tools & Models**: Runway Gen-3, Midjourney v6, Flux.1 Pro, ComfyUI, Kling, Luma Dream Machine
     - **Visual Styles**: Cinematic 35mm, Editorial Fashion, Sci-Fi Worldbuilding, Minimalist Product, Retro & Analog
     - **Availability**: Available Now vs. Booking Next Month / 2 Weeks
   - Real-time search across names, disciplines, prompt focus, tools, and bios.
   - Sort by Recommended, Rate: Low to High, Rate: High to Low, Top Rated.
   - Interactive shortlist bookmarking with reactive feedback toasts.

2. **Creator Profile — Elena Vance (`#profile/elena-vance`)**
   - Full creator dossier with verified emblem, location, response time (<24h), and availability status.
   - Real stats: completed projects (14), client rating (4.98/5 across 18 reviews), response turnaround.
   - Core Skills & Technical Pipeline matrix (Runway Gen-3, Midjourney v6, ComfyUI, Flux.1, Topaz Video AI, TouchDesigner).
   - Filterable portfolio gallery (Commercial Spots, Spec Work, Short Films) with playable simulated 4K reels and step-by-step prompt-to-render workflow breakdowns.
   - Collaborator testimonial from Creative Director Julien Mercier.
   - Commission packages (Starter Teaser, Full Campaign Spot, Bespoke Narrative Production) with direct inquiry modal.

3. **Post a Creative Brief (`#post-brief`)**
   - Structured 3-step brief wizard:
     - **Step 1: Scope & Purpose**: Project title, brand name, campaign objective, content type, narrative guidelines.
     - **Step 2: Visual Style & References**: Visual cards selector (Cinematic 35mm, Futuristic Photorealism, Surreal Editorial, etc.), live reference links manager, target aspect ratio chips.
     - **Step 3: Deliverables & Terms**: 4K video master, social cutdowns, clean stills, generation logs, deadline picker, realistic budget tiers ($1K-$3K, $3K-$6K, $6K-$12K, $12K+), commercial rights options.
   - Sticky live preview updating reactively in real time.
   - Explainable creator match estimator calculating live matches based on user's current selections.
   - Local draft autosave & instant publishing to the studio pipeline.

4. **Company Dashboard (`#dashboard`)**
   - Real-time studio metrics: Active Briefs, Received Proposals, Shortlisted Talent, Allocated Budget.
   - Studio pipeline of active briefs (`Solaar EV`, `Heritage Botanicals`, `Synthetica Sound`, and user-published briefs) with production status badges and assigned creator badges.
   - Shortlisted Talent sidebar reflecting real-time bookmarks from explorer and profile screens.

5. **Brief Detail & Explainable Recommendations (`#brief/brief-solaar-ev`)**
   - Detailed brief specification with high-resolution reference stills gallery, deliverables matrix, and sound design notes.
   - **Explainable AI Matching Algorithm**:
     - Calculates match percentages based on established criteria:
       - Skills match: 35%
       - Content type match: 25%
       - AI tools and models match: 20%
       - Output format match: 10%
       - Availability match: 10%
     - Transparent breakdown tags detailing *why* each creator matches (Matching Tools, Matching Style, Format Fit, Immediate Availability).
     - Recent relevant work reel previews and "Invite to Pitch" actions.
   - **Tender Administration**:
     - Filter between all proposals and shortlisted proposals.
     - Full director treatments (Elena Vance, Kaelen Chen, Studio Numen) with turnaround schedules, quoted fees, and mood reels.
     - "Review Treatment" interactive modal and "Accept Proposal" workflow assigning the creator and moving the brief into active production.

---

## Architecture & Data Flow

- **Frontend**: Lightweight Vite application with clean Vanilla CSS design tokens.
- **State Management**: Central reactive store (`src/data/store.js`) with event subscription and `localStorage` persistence.
- **Routing**: Hash-based client router (`src/router.js`) supporting direct deep links (`#explore`, `#profile/elena-vance`, `#post-brief`, `#dashboard`, `#brief/brief-solaar-ev`).
- **No Dead Links**: Every button, modal, form submit, bookmark toggle, filter, and tab is fully wired with real state updates and feedback toasts.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Development
```bash
# Navigate to directory
cd hacXLerate-

# Install dependencies
npm install

# Run local development server
npm run dev

# Run automated test suite
node test_app.js

# Build production bundle
npm run build
```

Open `http://localhost:3000/` in your browser.
