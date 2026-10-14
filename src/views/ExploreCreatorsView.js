// Screen 1: Explore Creators — Discovery & Filter View
import { store } from '../data/store.js';
import { showToast } from '../components/Toast.js';

export function renderCreatorCard(c) {
  const isSaved = store.isBookmarked(c.id);
  const topProject = c.portfolio?.[0] || {
    image: c.coverImage,
    aspectRatio: '16:9',
    duration: '0:45'
  };

  return `
    <article class="card card-lift" style="display: flex; flex-direction: column; justify-content: space-between;" id="card-${c.id}">
      <div>
        <!-- Thumbnail & Reel Preview -->
        <div style="position: relative; aspect-ratio: 16/9; overflow: hidden; background: var(--color-surface-container);">
          <img 
            src="${topProject.image || c.coverImage}" 
            alt="${c.name} Portfolio Sample" 
            style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;"
            class="portfolio-img-zoom"
          />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%);"></div>
          
          <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); color: #fff; font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); display: flex; align-items: center; gap: 4px; font-weight: 600;">
            <span class="material-symbols-outlined" style="font-size: 14px;">play_arrow</span>
            <span>Reel ${topProject.duration || '0:45'}</span>
          </div>

          <div style="position: absolute; bottom: 10px; left: 10px;">
            <span class="badge ${c.availability === 'Available Now' ? 'badge-primary' : 'badge-secondary'}" style="font-size: 10.5px;">
              ${c.availability}
            </span>
          </div>
        </div>

        <!-- Creator Details -->
        <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img 
                src="${c.avatar}" 
                alt="${c.name}" 
                style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid var(--color-outline-variant);"
              />
              <div>
                <h2 class="font-title-editorial" style="margin: 0; color: var(--color-primary); font-size: 17px;">
                  <a href="#profile/${c.id}" style="color: inherit;" class="hover-underline">${c.name}</a>
                </h2>
                <div class="font-body-sm" style="display: flex; align-items: center; gap: 2px; color: var(--color-outline); font-size: 12px;">
                  <span class="material-symbols-outlined" style="font-size: 13px;">location_on</span>
                  <span>${c.location}</span>
                </div>
              </div>
            </div>

            <div style="text-align: right;">
              <span class="font-label-tag" style="color: var(--color-outline); display: block; font-size: 10px;">Starting at</span>
              <span style="font-size: 14px; font-weight: 700; color: var(--color-primary);">${c.rateDisplay}</span>
            </div>
          </div>

          <div class="font-label-md" style="color: var(--color-on-surface); font-weight: 600;">
            ${c.discipline}
          </div>

          <!-- Key Tools -->
          <div>
            <div class="font-label-tag" style="color: var(--color-outline); margin-bottom: 0.35rem; font-size: 10px;">Tools:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${c.tools.slice(0, 3).map(t => `
                <span class="badge badge-outline" style="font-size: 10.5px; padding: 2px 6px;">${t}</span>
              `).join('')}
            </div>
          </div>

          <!-- Key Skills -->
          <div>
            <div class="font-label-tag" style="color: var(--color-outline); margin-bottom: 0.35rem; font-size: 10px;">Skills:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${c.skills.slice(0, 3).map(s => `
                <span class="badge badge-neutral" style="font-size: 10px; padding: 2px 6px;">${s}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Card Footer -->
      <div style="padding: 1.25rem; padding-top: 0; display: flex; align-items: center; gap: 0.5rem;">
        <a href="#profile/${c.id}" class="btn btn-primary" style="flex: 1; padding: 0.5rem; font-size: 13px; text-align: center;">
          View Portfolio
        </a>
        <button 
          class="btn-icon bookmark-creator-btn ${isSaved ? 'active' : ''}" 
          data-creator-id="${c.id}" 
          title="${isSaved ? 'Remove from shortlist' : 'Shortlist creator'}"
          aria-label="Bookmark Creator"
          style="width: 38px; height: 38px;"
        >
          <span class="material-symbols-outlined" style="font-size: 19px;">
            ${isSaved ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>
    </article>
  `;
}

export function renderExploreCreatorsView() {
  const creators = store.getCreators();
  const totalCount = creators.length;

  return `
    <div class="explore-creators-page" style="padding-top: 1.5rem; padding-bottom: 4rem;">
      <!-- Top Editorial Header & Discovery Bar -->
      <section class="container-max" style="margin-bottom: 2rem;">
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1.5rem;">
            <div style="max-width: 760px;">
              <h1 class="font-display-hero" style="margin-bottom: 0.5rem;">Explore AI Creators</h1>
              <p class="font-body-lg" style="margin: 0;">
                Discover world-class AI filmmakers, neural animators, and prompt directors ready for commercial briefs.
              </p>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; background: var(--color-surface-container-low); padding: 0.75rem 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--color-surface-container-high);">
              <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 24px;">groups</span>
              <div>
                <div class="font-label-md" id="roster-status-count" style="color: var(--color-on-surface); font-weight: 700;">Showing ${totalCount} featured creators</div>
                <div class="font-body-sm" style="color: var(--color-on-surface-variant); font-size: 12px;">Active roster available for commission</div>
              </div>
            </div>
          </div>

          <!-- Editorial Search & Quick Filter Container -->
          <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 280px; position: relative; display: flex; align-items: center;">
                <span class="material-symbols-outlined" style="position: absolute; left: 1rem; color: var(--color-outline); font-size: 20px;">search</span>
                <input 
                  type="text" 
                  id="creator-search-input" 
                  class="input" 
                  placeholder="Search creators by style, prompt focus, or tool (e.g. Runway, Cinematic, 35mm)..." 
                  style="padding-left: 2.75rem; font-size: 14.5px; height: 46px;"
                />
              </div>
              <button id="creator-search-btn" class="btn btn-primary" style="height: 46px; padding: 0 1.5rem;">
                <span>Search</span>
                <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
              </button>
            </div>

            <!-- Quick Filter Pills -->
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;" id="quick-filters-row">
              <span class="font-label-tag" style="color: var(--color-outline); margin-right: 0.25rem;">Popular:</span>
              <button class="filter-pill" data-pill-type="tool" data-pill-val="Runway Gen-3">
                <span class="material-symbols-outlined" style="font-size: 14px;">videocam</span> Runway Gen-3
              </button>
              <button class="filter-pill" data-pill-type="tool" data-pill-val="Midjourney">
                Midjourney v6.1
              </button>
              <button class="filter-pill" data-pill-type="style" data-pill-val="Cinematic 35mm">
                Cinematic 35mm
              </button>
              <button class="filter-pill" data-pill-type="discipline" data-pill-val="3D & Neural Animator">
                3D & Neural Animation
              </button>
              <button class="filter-pill" data-pill-type="availability" data-pill-val="Available Now">
                Available Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Marketplace Grid: Sidebar & Gallery -->
      <section class="container-max">
        <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 2rem; align-items: start;">
          <!-- Left Filter Sidebar (3 cols) -->
          <aside class="card" style="grid-column: span 12; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;" id="filter-sidebar">
            <style>
              @media (min-width: 1024px) {
                #filter-sidebar { grid-column: span 3 !important; }
                #gallery-main-column { grid-column: span 9 !important; }
              }
            </style>

            <!-- Active Filter Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-surface-container); padding-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="font-title-editorial" style="color: var(--color-primary); font-size: 17px;">Filter Roster</span>
                <span class="badge badge-neutral" id="active-filter-badge">0 Active</span>
              </div>
              <button id="reset-filters-btn" class="font-label-tag" style="background: none; border: none; color: var(--color-secondary); cursor: pointer; text-decoration: underline;">
                Reset
              </button>
            </div>

            <!-- Discipline Filter -->
            <div>
              <label class="font-label-lg" style="color: var(--color-primary); display: block; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Discipline
              </label>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;" id="filter-discipline-group">
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="AI Filmmaker" class="filter-checkbox" name="discipline" style="accent-color: var(--color-primary);" />
                    <span>AI Filmmaker</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">2</span>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="3D & Neural Animator" class="filter-checkbox" name="discipline" style="accent-color: var(--color-primary);" />
                    <span>3D & Neural Animator</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">1</span>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="Concept Artist" class="filter-checkbox" name="discipline" style="accent-color: var(--color-primary);" />
                    <span>Concept Artist</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">2</span>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="Visual Effects" class="filter-checkbox" name="discipline" style="accent-color: var(--color-primary);" />
                    <span>Visual Effects</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">1</span>
                </label>
              </div>
            </div>

            <div style="height: 1px; background: var(--color-surface-container);"></div>

            <!-- AI Tools & Models Filter -->
            <div>
              <label class="font-label-lg" style="color: var(--color-primary); display: block; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Key AI Tools & Models
              </label>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;" id="filter-tool-group">
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="Runway" class="filter-checkbox" name="tool" style="accent-color: var(--color-primary);" />
                    <span>Runway Gen-3</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">3</span>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="Midjourney" class="filter-checkbox" name="tool" style="accent-color: var(--color-primary);" />
                    <span>Midjourney</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">4</span>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="Flux" class="filter-checkbox" name="tool" style="accent-color: var(--color-primary);" />
                    <span>Flux.1 Pro</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">2</span>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="ComfyUI" class="filter-checkbox" name="tool" style="accent-color: var(--color-primary);" />
                    <span>ComfyUI</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">3</span>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="Kling" class="filter-checkbox" name="tool" style="accent-color: var(--color-primary);" />
                    <span>Kling</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">2</span>
                </label>
              </div>
            </div>

            <div style="height: 1px; background: var(--color-surface-container);"></div>

            <!-- Visual Style Filter -->
            <div>
              <label class="font-label-lg" style="color: var(--color-primary); display: block; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Visual Style
              </label>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;" id="filter-style-group">
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="Cinematic 35mm" class="filter-checkbox" name="style" style="accent-color: var(--color-primary);" />
                    <span>Cinematic 35mm</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">2</span>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="Editorial Fashion" class="filter-checkbox" name="style" style="accent-color: var(--color-primary);" />
                    <span>Editorial Fashion</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">2</span>
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; cursor: pointer;">
                  <span style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" value="Sci-Fi Worldbuilding" class="filter-checkbox" name="style" style="accent-color: var(--color-primary);" />
                    <span>Sci-Fi Worldbuilding</span>
                  </span>
                  <span class="font-label-tag" style="color: var(--color-outline);">1</span>
                </label>
              </div>
            </div>

            <div style="height: 1px; background: var(--color-surface-container);"></div>

            <!-- Availability Radio -->
            <div>
              <label class="font-label-lg" style="color: var(--color-primary); display: block; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Availability
              </label>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;" id="filter-avail-group">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 13.5px; cursor: pointer;">
                  <input type="radio" value="ALL" name="availability" checked class="filter-radio" style="accent-color: var(--color-primary);" />
                  <span>All Availability</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 13.5px; cursor: pointer;">
                  <input type="radio" value="Available Now" name="availability" class="filter-radio" style="accent-color: var(--color-primary);" />
                  <span>Available Now</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 13.5px; cursor: pointer;">
                  <input type="radio" value="Booking Next Month" name="availability" class="filter-radio" style="accent-color: var(--color-primary);" />
                  <span>Booking Next Month / In 2 Weeks</span>
                </label>
              </div>
            </div>
          </aside>

          <!-- Right Gallery Column (9 cols) -->
          <main class="gallery-area" id="gallery-main-column" style="grid-column: span 12; display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Live Results Bar & Sorting -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--color-surface-container-high); padding-bottom: 0.75rem;">
              <div style="display: flex; align-items: baseline; gap: 0.75rem;">
                <span class="font-title-editorial" id="results-count-title" style="color: var(--color-primary); font-size: 18px; font-weight: 700;">
                  ${totalCount} Curated Creators
                </span>
                <span class="font-body-sm" id="results-sub-count">showing full featured roster</span>
              </div>

              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 13px;">
                <span style="color: var(--color-on-surface-variant);">Sort by:</span>
                <select id="creator-sort-select" class="select" style="width: auto; padding: 0.35rem 0.85rem; font-size: 13px; height: 34px;">
                  <option value="recommended">Recommended</option>
                  <option value="rate-asc">Rate: Low to High</option>
                  <option value="rate-desc">Rate: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            <!-- Creator Cards Grid -->
            <div id="creators-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
              ${creators.map(c => renderCreatorCard(c)).join('')}
            </div>

            <!-- Empty State Container -->
            <div id="creators-empty-state" class="card" style="display: none; padding: 3.5rem 2rem; text-align: center; flex-direction: column; align-items: center; gap: 1rem;">
              <span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-outline);">person_search</span>
              <h3 class="font-headline-sm" style="color: var(--color-primary);">No creators match your criteria</h3>
              <p class="font-body-sm" style="max-width: 400px; margin: 0 auto; color: var(--color-on-surface-variant);">
                Try broadening your discipline, tools, or style filters to discover more generative artists in the roster.
              </p>
              <button class="btn btn-outline" id="empty-state-reset-btn" style="margin-top: 0.5rem;">
                Reset All Filters
              </button>
            </div>
          </main>
        </div>
      </section>
    </div>
  `;
}

export function initExploreCreatorsLogic() {
  const searchInput = document.getElementById('creator-search-input');
  const searchBtn = document.getElementById('creator-search-btn');
  const sortSelect = document.getElementById('creator-sort-select');
  const resetBtn = document.getElementById('reset-filters-btn');
  const emptyResetBtn = document.getElementById('empty-state-reset-btn');
  const filterBadge = document.getElementById('active-filter-badge');
  const cardsGrid = document.getElementById('creators-cards-grid');
  const emptyState = document.getElementById('creators-empty-state');
  const resultsCountTitle = document.getElementById('results-count-title');
  const resultsSubCount = document.getElementById('results-sub-count');

  let state = {
    search: '',
    disciplines: new Set(),
    tools: new Set(),
    styles: new Set(),
    availability: 'ALL',
    sort: 'recommended'
  };

  function update() {
    let list = [...store.getCreators()];

    // 1. Search Query
    if (state.search.trim()) {
      const q = state.search.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.discipline.toLowerCase().includes(q) ||
        c.tools.some(t => t.toLowerCase().includes(q)) ||
        c.skills.some(s => s.toLowerCase().includes(q)) ||
        c.bio.toLowerCase().includes(q)
      );
    }

    // 2. Disciplines
    if (state.disciplines.size > 0) {
      list = list.filter(c => state.disciplines.has(c.discipline));
    }

    // 3. Tools
    if (state.tools.size > 0) {
      list = list.filter(c => 
        Array.from(state.tools).some(t => c.tools.some(ct => ct.toLowerCase().includes(t.toLowerCase())))
      );
    }

    // 4. Styles
    if (state.styles.size > 0) {
      list = list.filter(c => 
        Array.from(state.styles).some(s => c.skills.some(cs => cs.toLowerCase().includes(s.toLowerCase())) || c.styles?.some(cs => cs.toLowerCase().includes(s.toLowerCase())))
      );
    }

    // 5. Availability
    if (state.availability !== 'ALL') {
      if (state.availability === 'Available Now') {
        list = list.filter(c => c.availability === 'Available Now');
      } else {
        list = list.filter(c => c.availability !== 'Available Now');
      }
    }

    // 6. Sort
    if (state.sort === 'rate-asc') {
      list.sort((a, b) => a.startingRate - b.startingRate);
    } else if (state.sort === 'rate-desc') {
      list.sort((a, b) => b.startingRate - a.startingRate);
    } else if (state.sort === 'rating') {
      list.sort((a, b) => b.stats.rating - a.stats.rating);
    }

    // Active filters count
    const activeCount = (state.search ? 1 : 0) + state.disciplines.size + state.tools.size + state.styles.size + (state.availability !== 'ALL' ? 1 : 0);
    if (filterBadge) {
      filterBadge.textContent = `${activeCount} Active`;
    }

    // Update Counts
    if (resultsCountTitle) {
      resultsCountTitle.textContent = `${list.length} Curated Creators`;
    }
    if (resultsSubCount) {
      resultsSubCount.textContent = `showing ${list.length} of ${store.getCreators().length} profiles`;
    }

    // Render cards
    if (list.length === 0) {
      cardsGrid.style.display = 'none';
      emptyState.style.display = 'flex';
    } else {
      cardsGrid.style.display = 'grid';
      emptyState.style.display = 'none';
      cardsGrid.innerHTML = list.map(c => renderCreatorCard(c)).join('');
      bindCardActions(cardsGrid);
    }
  }



  function bindCardActions(container) {
    container.querySelectorAll('.bookmark-creator-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const cid = btn.dataset.creatorId;
        const nowSaved = store.toggleBookmark(cid);
        const creator = store.getCreator(cid);
        if (nowSaved) {
          btn.classList.add('active');
          btn.querySelector('.material-symbols-outlined').textContent = 'bookmark';
          showToast(`Added ${creator?.name} to company shortlist`, 'bookmark');
        } else {
          btn.classList.remove('active');
          btn.querySelector('.material-symbols-outlined').textContent = 'bookmark_border';
          showToast(`Removed ${creator?.name} from shortlist`, 'bookmark_border');
        }
      };
    });
  }

  // Bind Listeners
  if (searchInput) {
    searchInput.oninput = (e) => {
      state.search = e.target.value;
      update();
    };
  }

  if (searchBtn) {
    searchBtn.onclick = () => update();
  }

  if (sortSelect) {
    sortSelect.onchange = (e) => {
      state.sort = e.target.value;
      update();
    };
  }

  // Sidebar Checkboxes
  document.querySelectorAll('.filter-checkbox').forEach(cb => {
    cb.onchange = () => {
      const name = cb.name;
      const val = cb.value;
      const targetSet = name === 'discipline' ? state.disciplines : (name === 'tool' ? state.tools : state.styles);
      if (cb.checked) {
        targetSet.add(val);
      } else {
        targetSet.delete(val);
      }
      update();
    };
  });

  // Radios
  document.querySelectorAll('.filter-radio').forEach(rb => {
    rb.onchange = () => {
      if (rb.checked) {
        state.availability = rb.value;
        update();
      }
    };
  });

  // Popular Pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.onclick = () => {
      const type = pill.dataset.pillType;
      const val = pill.dataset.pillVal;
      pill.classList.toggle('active');

      if (type === 'tool') {
        pill.classList.contains('active') ? state.tools.add(val) : state.tools.delete(val);
      } else if (type === 'style') {
        pill.classList.contains('active') ? state.styles.add(val) : state.styles.delete(val);
      } else if (type === 'discipline') {
        pill.classList.contains('active') ? state.disciplines.add(val) : state.disciplines.delete(val);
      } else if (type === 'availability') {
        state.availability = pill.classList.contains('active') ? val : 'ALL';
      }
      update();
    };
  });

  // Reset Button
  const resetFn = () => {
    state.search = '';
    state.disciplines.clear();
    state.tools.clear();
    state.styles.clear();
    state.availability = 'ALL';
    state.sort = 'recommended';

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'recommended';
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-radio').forEach(rb => rb.checked = (rb.value === 'ALL'));
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    update();
    showToast('Filters cleared', 'refresh');
  };

  if (resetBtn) resetBtn.onclick = resetFn;
  if (emptyResetBtn) emptyResetBtn.onclick = resetFn;

  // Initial render
  update();
}
