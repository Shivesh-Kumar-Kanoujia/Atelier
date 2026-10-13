// Atelier Global Header Component
import { store } from '../data/store.js';
import { auth, authApi } from '../api.js';

export function renderHeader(currentRoute = '') {
  const shortlistCount = store.getShortlistedCreators().length;
  const user = auth.getUser();
  const isLoggedIn = !!user;
  const isCreator = user?.role === 'creator';
  const isBrand = user?.role === 'brand';

  return `
    <header class="site-header">
      <div class="container-max header-inner">
        <!-- Brand -->
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <a href="#explore" class="brand-logo" id="brand-logo-link" title="Atelier — Where AI Creativity Meets Brands">
            <span>ATELIER</span>
            <span class="brand-badge" style="letter-spacing: 0.05em; font-size: 11px;">Where AI Creativity Meets Brands</span>
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
            <a href="${isCreator ? '#creator-dashboard' : '#dashboard'}" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none;">
              <span class="badge ${isCreator ? 'badge-primary' : 'badge-secondary'}" style="font-size: 11px; padding: 3px 8px;">
                ${isCreator ? 'Creator' : 'Brand / Org'}
              </span>
              <span class="font-label-md" style="color: var(--color-on-surface); font-weight: 600; font-size: 13px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${user.full_name || 'My Account'}
              </span>
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

export function initHeaderListeners() {
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

