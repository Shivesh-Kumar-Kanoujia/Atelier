// Atelier Global Header Component
import { store } from '../data/store.js';

export function renderHeader(currentRoute = '') {
  const shortlistCount = store.getShortlistedCreators().length;

  return `
    <header class="site-header">
      <div class="container-max header-inner">
        <!-- Brand -->
        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <a href="#explore" class="brand-logo" id="brand-logo-link">
            <span>ATELIER</span>
            <span class="brand-badge">Student Project MVP</span>
          </a>
        </div>

        <!-- Main Navigation -->
        <nav class="main-nav" id="global-nav">
          <a href="#explore" class="nav-link ${currentRoute === 'explore' ? 'active' : ''}" data-nav="explore">
            Explore Creators
          </a>
          <a href="#dashboard" class="nav-link ${currentRoute === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
            Company Dashboard
          </a>
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

          <!-- User Avatar -->
          <div style="display: flex; align-items: center; margin-left: 0.25rem;">
            <img 
              src="https://lh3.googleusercontent.com/aida/AEtjO1Xmlse1sOgUD_1WXXSnMotS2hQtA07zNpu6xk5zp-kWrkw8gNnvbo_VkH5NZYP_0n542ljY6o6WndJj5M0tYrY1iJI_jzeMUgzoiKxeoalEMpHtGieT31AOEgap05ActuGq9UgNBvE255rZMuolqQfbzcX-tGMHBpViKY79chtn-6dHBZz-hclVx38ApCydhYkoyyaLp31kXFZfV21aE4fLAy5EWhRt9RS8eQw0sgrPrLsNua1DNjy8zg" 
              alt="Profile" 
              style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1px solid var(--color-outline-variant);"
            />
          </div>
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
}
