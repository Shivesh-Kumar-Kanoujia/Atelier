// Atelier Global Header Component
import { store } from '../data/store.js';
import { auth, authApi, profileApi } from '../api.js';

/**
 * Resolves the authenticated user's avatar image URL from existing profile data,
 * storage, and reactive store without hardcoding names or URLs.
 */
export function getAuthenticatedUserAvatar(user) {
  if (!user) return null;
  if (user.avatar_url) return user.avatar_url;
  if (user.avatar) return user.avatar;
  if (user.logo_url) return user.logo_url;

  if (user.role === 'creator') {
    try {
      const saved = localStorage.getItem('atelier_creator_avatar_v1');
      if (saved) return saved;
    } catch {}

    const creators = store.getCreators();
    let creator = null;
    if (user.id) creator = store.getCreator(user.id);
    if (!creator && user.email) creator = creators.find(c => c.email === user.email);
    if (!creator && user.full_name) {
      creator = creators.find(c => c.name?.toLowerCase() === user.full_name.toLowerCase());
    }
    if (!creator && (user.full_name === 'Elena Vance' || user.id === 'elena-vance')) {
      creator = store.getCreator('elena-vance');
    }
    if (creator?.avatar) return creator.avatar;
    if (creator?.avatar_url) return creator.avatar_url;
  } else if (user.role === 'brand') {
    try {
      const savedLogo = localStorage.getItem('atelier_brand_logo_v1');
      if (savedLogo) return savedLogo;
    } catch {}
  }

  return null;
}

/**
 * Returns initials for fallback avatar display.
 */
export function getUserInitials(user) {
  const name = user?.full_name || (user?.role === 'brand' ? 'Brand Org' : 'User');
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'AT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function renderHeader(currentRoute = '') {
  const shortlistCount = store.getShortlistedCreators().length;
  const user = auth.getUser();
  const isLoggedIn = !!user;
  const isCreator = user?.role === 'creator';
  const isBrand = user?.role === 'brand';
  const userName = user?.full_name || 'My Account';
  const avatarUrl = isLoggedIn ? getAuthenticatedUserAvatar(user) : null;
  const initials = isLoggedIn ? getUserInitials(user) : '';
  const dashboardLink = isCreator ? '#creator-dashboard' : '#dashboard';

  return `
    <header class="site-header">
      <div class="container-max header-inner">
        <!-- Brand -->
        <div style="display: flex; align-items: center;">
          <a href="#explore" class="brand-logo" id="brand-logo-link" title="Atelier">
            <span>ATELIER</span>
          </a>
        </div>

        <!-- Main Navigation -->
        <nav class="main-nav" id="global-nav">
          <a href="#explore" class="nav-link ${currentRoute === 'explore' ? 'active' : ''}" data-nav="explore">
            Explore Creators
          </a>
          ${(!isLoggedIn || isBrand) ? `
          <a href="#dashboard" class="nav-link ${currentRoute === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
            Company Dashboard
          </a>
          ` : ''}
          ${(!isLoggedIn || isCreator) ? `
          <a href="#creator-dashboard" class="nav-link ${currentRoute === 'creator-dashboard' ? 'active' : ''}" data-nav="creator-dashboard">
            Creator Studio
          </a>
          ` : ''}
          <a href="#brief/brief-solaar-ev" class="nav-link ${currentRoute.startsWith('brief') ? 'active' : ''}" data-nav="briefs">
            Briefs & Projects
          </a>
        </nav>

        <!-- Right Action Controls -->
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <!-- Search Archive Button -->
          <button id="header-search-btn" class="btn-icon" aria-label="Search Archive" title="Search Creators" style="display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="font-size: 20px;">search</span>
          </button>

          <!-- Post a Brief CTA -->
          <a href="#post-brief" class="btn btn-primary" id="header-post-brief-btn" style="font-size: 13px; padding: 0.5rem 1rem;">
            <span class="material-symbols-outlined" style="font-size: 17px;">edit_document</span>
            <span>Post a Brief</span>
          </a>

          <!-- Shortlist Quick Access -->
          <a href="#dashboard" class="btn-icon" id="header-shortlist-btn" title="View Shortlisted Talent" aria-label="Shortlisted Talent" style="position: relative; display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="font-size: 20px;">bookmark</span>
            ${shortlistCount > 0 ? `<span style="position: absolute; top: -4px; right: -4px; background: var(--color-secondary); color: #fff; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">${shortlistCount}</span>` : ''}
          </a>

          ${isLoggedIn ? `
          <!-- User Profile & Sign Out -->
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: 0.25rem;">
            <a href="${dashboardLink}" class="header-profile-link" title="${userName}" aria-label="Profile of ${userName}">
              <span class="badge ${isCreator ? 'badge-primary' : 'badge-secondary'}" style="font-size: 11px; padding: 3px 8px;">
                ${isCreator ? 'Creator' : 'Brand / Org'}
              </span>
              ${avatarUrl ? `
                <div class="header-avatar" title="${userName}">
                  <img src="${avatarUrl}" alt="${userName}" onerror="this.onerror=null; this.parentElement.classList.add('header-avatar-fallback'); this.parentElement.innerHTML='<span>${initials}</span>';" />
                </div>
              ` : `
                <div class="header-avatar header-avatar-fallback" title="${userName}">
                  <span>${initials}</span>
                </div>
              `}
            </a>
            <button id="header-logout-btn" class="btn-icon" title="Sign Out" aria-label="Sign Out" style="display: flex; align-items: center; justify-content: center; color: var(--color-outline);">
              <span class="material-symbols-outlined" style="font-size: 18px;">logout</span>
            </button>
          </div>
          ` : `
          <!-- Auth CTA (Guest) -->
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <a href="#login" class="nav-link ${currentRoute === 'login' ? 'active' : ''}" style="font-size: 13px; padding: 0.4rem 0.65rem;">
              Sign In
            </a>
            <a href="#register" class="btn btn-outline" style="font-size: 12.5px; padding: 0.45rem 0.85rem;">
              Join Atelier
            </a>
          </div>
          `}
        </div>
      </div>
    </header>
  `;
}

let isSyncing = false;
async function syncRemoteAvatar() {
  if (isSyncing || !auth.isLoggedIn()) return;
  isSyncing = true;
  try {
    const user = auth.getUser();
    if (!user || user.avatar_url) return;
    if (user.role === 'creator') {
      const prof = await profileApi.getMyCreatorProfile();
      if (prof?.avatar_url) {
        auth.setUser({ ...user, avatar_url: prof.avatar_url, avatar: prof.avatar_url });
        store.notify();
      }
    } else if (user.role === 'brand') {
      const prof = await profileApi.getMyBrandProfile();
      if (prof?.logo_url) {
        auth.setUser({ ...user, logo_url: prof.logo_url, avatar_url: prof.logo_url });
        try { localStorage.setItem('atelier_brand_logo_v1', prof.logo_url); } catch {}
        store.notify();
      }
    }
  } catch {
    // Graceful fallback for offline / unseeded profile
  } finally {
    isSyncing = false;
  }
}

export function initHeaderListeners() {
  syncRemoteAvatar();

  const searchBtn = document.getElementById('header-search-btn');
  if (searchBtn) {
    searchBtn.onclick = () => {
      if (window.location.hash !== '#explore') {
        window.location.hash = '#explore';
      }
      setTimeout(() => {
        const input = document.getElementById('creator-search-input');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };
  }

  const logoutBtn = document.getElementById('header-logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await authApi.logout();
      window.location.hash = '#login';
    };
  }
}

