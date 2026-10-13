// Central Reactive State Store for Atelier Marketplace
import { INITIAL_CREATORS } from './creators.js';
import { INITIAL_BRIEFS } from './briefs.js';
import { INITIAL_PROPOSALS } from './proposals.js';

const STORAGE_KEYS = {
  BRIEFS: 'atelier_briefs_v1',
  PROPOSALS: 'atelier_proposals_v1',
  BOOKMARKS: 'atelier_bookmarks_v1',
  DRAFT_BRIEF: 'atelier_draft_brief_v1'
};

class Store {
  constructor() {
    this.creators = [...INITIAL_CREATORS];
    this.briefs = this.load(STORAGE_KEYS.BRIEFS, INITIAL_BRIEFS);
    this.proposals = this.load(STORAGE_KEYS.PROPOSALS, INITIAL_PROPOSALS);
    this.bookmarks = new Set(this.load(STORAGE_KEYS.BOOKMARKS, ['elena-vance', 'kaelen-chen', 'studio-numen']));
    this.listeners = new Set();
  }

  load(key, fallback) {
    try {
      if (typeof localStorage === 'undefined') return fallback;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  save(key, val) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    for (const fn of this.listeners) {
      try {
        fn(this);
      } catch (e) {
        console.error("Store listener error", e);
      }
    }
  }

  // --- Creator & Shortlist Queries ---
  getCreators() {
    return this.creators;
  }

  getCreator(id) {
    return this.creators.find(c => c.id === id) || null;
  }

  isBookmarked(id) {
    return this.bookmarks.has(id);
  }

  toggleBookmark(id) {
    if (this.bookmarks.has(id)) {
      this.bookmarks.delete(id);
    } else {
      this.bookmarks.add(id);
    }
    this.save(STORAGE_KEYS.BOOKMARKS, Array.from(this.bookmarks));
    this.notify();
    return this.bookmarks.has(id);
  }

  getShortlistedCreators() {
    return this.creators.filter(c => this.bookmarks.has(c.id));
  }

  // --- Briefs ---
  getBriefs() {
    return this.briefs;
  }

  getBrief(id) {
    return this.briefs.find(b => b.id === id) || null;
  }

  publishBrief(formData) {
    const id = 'brief-' + Date.now();
    const newBrief = {
      id,
      code: `BRIEF-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title || "Untitled Brief",
      client: formData.client || "Studio Client",
      status: "reviewing",
      statusLabel: "Reviewing Pitches (0 Received)",
      objective: formData.objective || "Brand Awareness",
      contentType: formData.contentType || "AI Commercial / Video Spot",
      description: formData.description || "",
      budgetTier: formData.budgetTier || "$3,000 – $6,000 USD",
      budgetAmount: parseInt(formData.budgetTier?.replace(/[^0-9]/g, '')) || 4500,
      deadline: formData.deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      deadlineFormatted: formData.deadline ? new Date(formData.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "In 2 Weeks",
      commercialRights: formData.commercialUse || "Full Commercial Rights",
      commercialRightsSummary: formData.commercialUse === "Non-Commercial / Portfolio" ? "Festival showcases and portfolio usage only." : "Marketing, paid campaigns & ads worldwide.",
      styles: formData.styles || ["Cinematic 35mm"],
      aspectRatios: formData.aspectRatios || ["16:9 Widescreen"],
      deliverables: formData.deliverables || ["Master 4K Video Render"],
      requiredTools: ["Runway Gen-3", "ComfyUI"],
      referenceLinks: formData.referenceLinks || [],
      referenceImages: formData.referenceImages || [
        {
          title: "Style Keyframe",
          subtitle: "Aesthetic Direction Reference",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwqPK5N99YgN6C3cQHFxni2mp209fWDa5JjlhYep8sMKe647OGwagUWE7EbruYFPYwjV3OQTnidM8Epx2518s8HV1Wr14rQGQQu1TekyCPqbwj8hIbRVugZ3rrbEVheJPcu8XYnykclOLXSINdLXjcOI-t2cUlGWVVwyDahCxQL3VsV12zK6ncV1tokVsecj1-4pBFRYIeYaLtdq3ex1PjOknp_nJmu7S8V5T7s_Y3d7fKnoyubzkt4g"
        }
      ],
      proposalsCount: 0,
      createdAt: new Date().toISOString()
    };

    this.briefs.unshift(newBrief);
    this.save(STORAGE_KEYS.BRIEFS, this.briefs);
    this.clearDraftBrief();
    this.notify();
    return newBrief;
  }

  saveDraftBrief(data) {
    this.save(STORAGE_KEYS.DRAFT_BRIEF, data);
  }

  getDraftBrief() {
    return this.load(STORAGE_KEYS.DRAFT_BRIEF, null);
  }

  clearDraftBrief() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.DRAFT_BRIEF);
      }
    } catch {}
  }

  // --- Proposals ---
  getProposals(briefId) {
    if (!briefId) return this.proposals;
    return this.proposals.filter(p => p.briefId === briefId);
  }

  acceptProposal(proposalId) {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal) return false;

    proposal.status = "accepted";
    const brief = this.getBrief(proposal.briefId);
    if (brief) {
      brief.status = "in_production";
      brief.statusLabel = "In Production";
      brief.assignedCreatorId = proposal.creatorId;
      brief.assignedCreatorName = proposal.creatorName;
      brief.assignedCreatorAvatar = proposal.creatorAvatar;
    }

    this.save(STORAGE_KEYS.PROPOSALS, this.proposals);
    this.save(STORAGE_KEYS.BRIEFS, this.briefs);
    this.notify();
    return true;
  }

  toggleProposalShortlist(proposalId) {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal) return false;
    proposal.shortlisted = !proposal.shortlisted;
    this.save(STORAGE_KEYS.PROPOSALS, this.proposals);
    this.notify();
    return proposal.shortlisted;
  }

  // --- Explainable Matching Algorithm ---
  // Weights (per README.md):
  // Skills match: 35%
  // Content type match: 25%
  // AI tools and models match: 20%
  // Output format match: 10%
  // Availability match: 10%
  calculateMatch(creator, brief) {
    if (!brief) {
      return {
        score: 95,
        breakdown: [
          { text: "Curated for high-tier aesthetic fidelity", icon: "verified" },
          { text: `Tools: ${creator.tools.slice(0, 2).join(', ')}`, icon: "tune" },
          { text: `Availability: ${creator.availability}`, icon: "schedule" }
        ],
        matchingTools: creator.tools.slice(0, 2),
        matchingStyles: creator.skills.slice(0, 2),
        formatFit: creator.formats?.[0] || "16:9 • 4K",
        availabilityFit: creator.availability
      };
    }

    // 1. Skills match (35%)
    let skillOverlap = 0;
    const briefStyles = brief.styles || [];
    for (const style of briefStyles) {
      if (creator.skills.some(s => s.toLowerCase().includes(style.toLowerCase()) || style.toLowerCase().includes(s.toLowerCase())) ||
          creator.styles?.some(s => s.toLowerCase().includes(style.toLowerCase()))) {
        skillOverlap++;
      }
    }
    const skillScore = briefStyles.length > 0 
      ? Math.min(1, 0.75 + (skillOverlap / Math.max(1, briefStyles.length)) * 0.25) 
      : 0.90;

    // 2. Content type match (25%)
    const briefContent = (brief.contentType || "").toLowerCase();
    const isFilmmaker = creator.discipline.includes("Filmmaker") || creator.title.includes("Director");
    const isAnimator = creator.discipline.includes("Animator");
    let contentScore = 0.8;
    if (briefContent.includes("video") || briefContent.includes("commercial")) {
      contentScore = isFilmmaker ? 1.0 : (isAnimator ? 0.95 : 0.8);
    } else if (briefContent.includes("visualizer") || briefContent.includes("animated")) {
      contentScore = isAnimator ? 1.0 : 0.90;
    } else if (briefContent.includes("still") || briefContent.includes("lookbook")) {
      contentScore = creator.discipline.includes("Concept") ? 1.0 : 0.85;
    }

    // 3. AI tools match (20%)
    const requiredTools = brief.requiredTools || ["Runway Gen-3", "ComfyUI"];
    let toolOverlap = 0;
    for (const tool of requiredTools) {
      if (creator.tools.some(t => t.toLowerCase().includes(tool.toLowerCase()) || tool.toLowerCase().includes(t.toLowerCase()))) {
        toolOverlap++;
      }
    }
    const toolScore = requiredTools.length > 0 
      ? Math.min(1, 0.75 + (toolOverlap / Math.max(1, requiredTools.length)) * 0.25) 
      : 0.90;

    // 4. Output format match (10%)
    const briefRatios = brief.aspectRatios || [];
    let formatScore = 0.85;
    if (briefRatios.some(r => r.includes("16:9")) && creator.formats?.some(f => f.includes("16:9"))) {
      formatScore = 1.0;
    } else if (creator.formats && creator.formats.length > 0) {
      formatScore = 0.95;
    }

    // 5. Availability match (10%)
    let availScore = 0.8;
    if (creator.availability === "Available Now") {
      availScore = 1.0;
    } else if (creator.availability.includes("2 Weeks")) {
      availScore = 0.90;
    } else {
      availScore = 0.75;
    }

    const totalWeight = (skillScore * 0.35) + (contentScore * 0.25) + (toolScore * 0.20) + (formatScore * 0.10) + (availScore * 0.10);
    // Scale realistically between 78% and 98%
    const scorePercent = Math.min(99, Math.max(78, Math.round(totalWeight * 100)));

    const matchingTools = creator.tools.filter(t => (brief.requiredTools || []).some(rt => t.toLowerCase().includes(rt.toLowerCase()) || rt.toLowerCase().includes(t.toLowerCase())));
    const fallbackTools = matchingTools.length > 0 ? matchingTools : creator.tools.slice(0, 2);

    const matchingStyles = creator.skills.filter(s => (brief.styles || []).some(bs => s.toLowerCase().includes(bs.toLowerCase()) || bs.toLowerCase().includes(s.toLowerCase())));
    const fallbackStyles = matchingStyles.length > 0 ? matchingStyles : creator.skills.slice(0, 2);

    const breakdown = [
      {
        type: 'tools',
        text: `Matching Tools: ${fallbackTools.join(', ')}`,
        icon: 'check_circle'
      },
      {
        type: 'style',
        text: `Matching Style: ${fallbackStyles.join(', ')}`,
        icon: 'check_circle'
      },
      {
        type: 'format',
        text: `Format Fit: ${brief.aspectRatios?.join(' & ') || '16:9 4K Master'}`,
        icon: 'check_circle'
      },
      {
        type: 'availability',
        text: `Availability: ${creator.availability}`,
        icon: 'schedule',
        highlight: creator.availability === 'Available Now'
      }
    ];

    return {
      score: scorePercent,
      breakdown,
      matchingTools: fallbackTools,
      matchingStyles: fallbackStyles,
      formatFit: brief.aspectRatios?.join(' & ') || '16:9 4K',
      availabilityFit: creator.availability
    };
  }

  getRecommendedCreatorsForBrief(brief, limit = 3) {
    const scored = this.creators.map(c => {
      const match = this.calculateMatch(c, brief);
      return {
        creator: c,
        match
      };
    });

    scored.sort((a, b) => b.match.score - a.match.score);
    return scored.slice(0, limit);
  }
}

export const store = new Store();
