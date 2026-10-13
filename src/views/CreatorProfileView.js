// Screen 2: Creator Profile View (Elena Vance & Dynamic Creator Dossier)
import { store } from '../data/store.js';
import { showToast } from '../components/Toast.js';
import { openModal } from '../components/Modal.js';

export function renderCreatorProfileView(creatorId = 'elena-vance') {
  const creator = store.getCreator(creatorId) || store.getCreator('elena-vance');
  if (!creator) {
    return `
      <div class="container-max" style="padding: 4rem 1rem; text-align: center;">
        <h2 class="font-headline-md" style="color: var(--color-primary);">Creator not found</h2>
        <a href="#explore" class="btn btn-primary" style="margin-top: 1rem;">Back to Directory</a>
      </div>
    `;
  }

  const isSaved = store.isBookmarked(creator.id);
  const portfolio = creator.portfolio || [];

  return `
    <div class="creator-profile-page" style="padding-bottom: 5rem;">
      <!-- Breadcrumb Bar -->
      <div style="background: var(--color-surface); border-bottom: 1px solid var(--color-surface-container); padding: 0.75rem 0;">
        <div class="container-max" style="display: flex; align-items: center; gap: 0.5rem; font-size: 13px; color: var(--color-on-surface-variant);">
          <a href="#explore" class="hover-underline">Explore Creators</a>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span style="color: var(--color-primary); font-weight: 600;">${creator.name}</span>
        </div>
      </div>

      <!-- Dossier Hero Section -->
      <section class="container-max" style="padding-top: 2.5rem; padding-bottom: 3rem;">
        <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 2.5rem; align-items: start;">
          <!-- Left Column: Portrait & Metadata (4 cols) -->
          <div style="grid-column: span 12;" id="profile-left-col">
            <style>
              @media (min-width: 1024px) {
                #profile-left-col { grid-column: span 4 !important; }
                #profile-right-col { grid-column: span 8 !important; }
              }
            </style>

            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <!-- Portrait Image -->
              <div class="card" style="padding: 0.75rem; overflow: hidden; background: #fff;">
                <div style="aspect-ratio: 1/1; position: relative; border-radius: var(--radius-md); overflow: hidden;">
                  <img 
                    src="${creator.avatar}" 
                    alt="${creator.name}" 
                    style="width: 100%; height: 100%; object-fit: cover;"
                  />
                  <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(10, 53, 37, 0.9); backdrop-filter: blur(8px); color: #fff; padding: 4px 10px; border-radius: var(--radius-xs); font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                    <span class="material-symbols-outlined" style="font-size: 14px; color: var(--color-secondary-gold);">verified</span>
                    <span>Curated Artist</span>
                  </div>
                </div>
              </div>

              <!-- Quick Metadata Card -->
              <div class="card" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                  <span class="font-label-tag" style="color: var(--color-outline);">Location</span>
                  <span style="font-weight: 600; color: var(--color-on-surface);">${creator.location}</span>
                </div>
                <div style="height: 1px; background: var(--color-surface-container);"></div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                  <span class="font-label-tag" style="color: var(--color-outline);">Response Time</span>
                  <span style="font-weight: 600; color: var(--color-on-surface);">${creator.responseTime || 'Within 24h'}</span>
                </div>
                <div style="height: 1px; background: var(--color-surface-container);"></div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                  <span class="font-label-tag" style="color: var(--color-outline);">Availability</span>
                  <span style="font-weight: 700; color: var(--color-primary);">${creator.availabilityDetail || creator.availability}</span>
                </div>
              </div>

              <!-- Public Channels -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem;">
                <span class="font-label-tag" style="color: var(--color-outline); letter-spacing: 0.08em;">Channels</span>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <button class="btn-icon" title="Vimeo Reel" style="width: 32px; height: 32px;" onclick="window.open('https://vimeo.com', '_blank')">
                    <span class="material-symbols-outlined" style="font-size: 16px;">movie</span>
                  </button>
                  <button class="btn-icon" title="Behance Collection" style="width: 32px; height: 32px;" onclick="window.open('https://behance.net', '_blank')">
                    <span class="material-symbols-outlined" style="font-size: 16px;">brush</span>
                  </button>
                  <button class="btn-icon" title="Workflows & Tools" style="width: 32px; height: 32px;" onclick="window.open('https://github.com', '_blank')">
                    <span class="material-symbols-outlined" style="font-size: 16px;">terminal</span>
                  </button>
                  <button class="btn-icon" id="direct-email-btn" title="Contact Email" style="width: 32px; height: 32px;">
                    <span class="material-symbols-outlined" style="font-size: 16px;">mail</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Title, Bio, Stats, CTAs (8 cols) -->
          <div style="grid-column: span 12;" id="profile-right-col">
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
                  <span class="badge badge-secondary" style="font-size: 11px;">
                    ${creator.title}
                  </span>
                  <span class="badge badge-neutral" style="font-size: 11px;">
                    ${creator.location}
                  </span>
                </div>
                <h1 class="font-display-hero" style="margin-bottom: 0.5rem; color: var(--color-on-surface);">
                  ${creator.name}
                </h1>
                <p class="font-headline-sm" style="color: var(--color-secondary); margin-bottom: 1rem; font-weight: 500;">
                  ${creator.title}
                </p>
                <p class="font-body-lg" style="line-height: 1.65; max-width: 800px;">
                  ${creator.bio}
                </p>
              </div>

              <!-- Stats Strip -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
                <div class="card" style="padding: 1.25rem;">
                  <span class="font-label-tag" style="color: var(--color-outline);">Completed Work</span>
                  <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.5rem;">
                    <span class="font-headline-lg" style="color: var(--color-primary);">${creator.stats.completedProjects}</span>
                    <span class="font-body-sm" style="color: var(--color-on-surface-variant);">Completed Projects</span>
                  </div>
                </div>

                <div class="card" style="padding: 1.25rem;">
                  <span class="font-label-tag" style="color: var(--color-outline);">Client Rating</span>
                  <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.5rem;">
                    <span class="font-headline-lg" style="color: var(--color-primary);">${creator.stats.rating}</span>
                    <span class="font-body-sm" style="color: var(--color-secondary); font-weight: 600;">(${creator.stats.reviewsCount} Reviews)</span>
                  </div>
                </div>

                <div class="card" style="padding: 1.25rem;">
                  <span class="font-label-tag" style="color: var(--color-outline);">Communication</span>
                  <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.5rem;">
                    <span class="font-headline-lg" style="color: var(--color-primary);">${creator.stats.responseTime}</span>
                    <span class="font-body-sm" style="color: var(--color-on-surface-variant);">Response time</span>
                  </div>
                </div>
              </div>

              <!-- CTAs Strip -->
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; padding-top: 0.5rem;">
                <button class="btn btn-primary" id="profile-contact-btn" style="padding: 0.75rem 1.75rem; font-size: 14px;">
                  <span class="material-symbols-outlined" style="font-size: 19px;">mail</span>
                  <span>Contact Creator</span>
                </button>

                <button class="btn btn-outline" id="profile-bookmark-btn" style="padding: 0.75rem 1.25rem; font-size: 14px;">
                  <span class="material-symbols-outlined" style="font-size: 19px;">${isSaved ? 'bookmark' : 'bookmark_border'}</span>
                  <span>${isSaved ? 'Bookmarked in Shortlist' : 'Bookmark Creator'}</span>
                </button>

                <button class="btn-icon" id="profile-share-btn" title="Share Creator Dossier" style="width: 44px; height: 44px;">
                  <span class="material-symbols-outlined" style="font-size: 20px;">share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Technical Specifications & Pipeline Matrix -->
      <section class="container-max" style="margin-bottom: 3.5rem;">
        <div class="card" style="padding: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
          <!-- Spec 1: Core Skills & Pipeline -->
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 22px;">hub</span>
              <h2 class="font-title-editorial" style="color: var(--color-primary); margin: 0; font-size: 18px;">Core Skills & Pipeline</h2>
            </div>
            <p class="font-body-sm" style="color: var(--color-on-surface-variant); margin-bottom: 1rem;">
              Generative tooling, neural rendering models, and motion synthesis toolset.
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${creator.tools.map(tool => `
                <span class="badge badge-neutral" style="font-size: 11.5px; padding: 4px 10px;">${tool}</span>
              `).join('')}
            </div>
          </div>

          <!-- Spec 2: Specializations -->
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 22px;">category</span>
              <h2 class="font-title-editorial" style="color: var(--color-primary); margin: 0; font-size: 18px;">Creative Specializations</h2>
            </div>
            <p class="font-body-sm" style="color: var(--color-on-surface-variant); margin-bottom: 1rem;">
              Disciplines and creative output tailored for commercial motion and storytelling.
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${creator.skills.map(skill => `
                <span class="badge badge-secondary" style="font-size: 11.5px; padding: 4px 10px;">${skill}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- Visual Portfolio Grid -->
      <section class="container-max" style="margin-bottom: 4rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <span class="font-label-tag" style="color: var(--color-secondary); letter-spacing: 0.1em;">Curated Projects</span>
            <h2 class="font-headline-lg" style="color: var(--color-primary); margin-top: 0.25rem;">Portfolio & Selected Works</h2>
          </div>

          <!-- Filter Tabs -->
          <div style="display: flex; background: var(--color-surface-container); padding: 4px; border-radius: var(--radius-md); gap: 4px;" id="portfolio-tabs">
            <button class="portfolio-tab-btn active" data-tab="all" style="border: none; background: #fff; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; color: var(--color-primary); cursor: pointer; box-shadow: var(--shadow-sm);">
              All Works (${portfolio.length})
            </button>
            <button class="portfolio-tab-btn" data-tab="Commercial" style="border: none; background: transparent; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; color: var(--color-on-surface-variant); cursor: pointer;">
              Commercial Spots
            </button>
            <button class="portfolio-tab-btn" data-tab="Spec Work" style="border: none; background: transparent; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; color: var(--color-on-surface-variant); cursor: pointer;">
              Spec Work
            </button>
            <button class="portfolio-tab-btn" data-tab="Short Film" style="border: none; background: transparent; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; color: var(--color-on-surface-variant); cursor: pointer;">
              Short Films
            </button>
          </div>
        </div>

        <!-- Portfolio Cards Grid -->
        <div id="portfolio-items-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2rem;">
          ${portfolio.map((item, idx) => renderPortfolioCard(item, idx)).join('')}
        </div>
      </section>

      <!-- Collaborator Feedback & Agency Testimonial -->
      ${creator.testimonial ? `
        <section class="container-max" style="margin-bottom: 4rem;">
          <div class="card" style="padding: clamp(2rem, 4vw, 3.5rem); position: relative; overflow: hidden; background: #fff;">
            <span class="material-symbols-outlined" style="position: absolute; right: 1rem; top: 0; font-size: 180px; color: rgba(255, 221, 183, 0.25); pointer-events: none; select: none;">
              format_quote
            </span>
            <div style="position: relative; z-index: 2; max-width: 820px;">
              <span class="font-label-tag" style="color: var(--color-secondary); letter-spacing: 0.15em;">Collaborator Feedback</span>
              <blockquote class="font-headline-md" style="color: var(--color-on-surface); line-height: 1.45; margin: 1.25rem 0 1.75rem;">
                “${creator.testimonial.quote}”
              </blockquote>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <img 
                  src="${creator.testimonial.avatar}" 
                  alt="${creator.testimonial.author}" 
                  style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover;"
                />
                <div>
                  <div class="font-title-editorial" style="color: var(--color-on-surface); font-size: 16px;">
                    ${creator.testimonial.author}
                  </div>
                  <div class="font-body-sm" style="color: var(--color-on-surface-variant);">
                    ${creator.testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ` : ''}

      <!-- Commission Packages & Pricing -->
      <section class="container-max" id="packages-section" style="margin-bottom: 2rem;">
        <div style="text-align: center; max-width: 600px; margin: 0 auto 2.5rem;">
          <span class="font-label-tag" style="color: var(--color-secondary); letter-spacing: 0.15em;">Services & Pricing</span>
          <h2 class="font-headline-lg" style="color: var(--color-primary); margin-top: 0.25rem;">Commission Packages</h2>
          <p class="font-body-md" style="color: var(--color-on-surface-variant); margin-top: 0.5rem;">
            Simple, transparent production packages tailored for brands, indie projects, and commercial agencies.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; align-items: stretch;">
          ${(creator.packages || []).map(pkg => `
            <div class="card" style="padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; ${pkg.featured ? 'border: 2px solid var(--color-secondary-gold); box-shadow: var(--shadow-lg);' : ''}">
              ${pkg.featured ? `
                <div style="position: absolute; top: -11px; left: 50%; transform: translateX(-50%); background: var(--color-secondary-gold); color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 10px; border-radius: var(--radius-full); letter-spacing: 0.08em;">
                  Most Popular
                </div>
              ` : ''}
              <div>
                <h3 class="font-title-editorial" style="color: var(--color-primary); font-size: 20px; margin-bottom: 0.5rem;">${pkg.title}</h3>
                <div style="font-size: 28px; font-weight: 700; color: var(--color-on-surface); font-family: var(--font-headline); margin-bottom: 0.25rem;">
                  ${pkg.price}
                </div>
                <div class="font-label-tag" style="color: var(--color-outline); margin-bottom: 1.5rem;">
                  ${pkg.duration}
                </div>

                <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem;">
                  ${pkg.features.map(f => `
                    <li style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 13.5px; color: var(--color-on-surface);">
                      <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 18px; shrink-0;">check</span>
                      <span>${f}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              <button class="btn ${pkg.featured ? 'btn-primary' : 'btn-outline'} commission-pkg-btn" data-pkg-title="${pkg.title}" data-pkg-price="${pkg.price}" style="width: 100%;">
                Commission Package
              </button>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderPortfolioCard(item, idx) {
  return `
    <article class="card card-lift portfolio-card" data-category="${item.type}" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <!-- Media Container -->
        <div style="position: relative; aspect-ratio: 16/9; overflow: hidden; background: var(--color-inverse-surface);">
          <img 
            src="${item.image}" 
            alt="${item.title}" 
            style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" 
            class="portfolio-img-zoom"
          />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%);"></div>

          <!-- Play Button Overlay -->
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
            <button 
              class="play-reel-trigger-btn" 
              data-item-title="${item.title}" 
              data-item-img="${item.image}"
              data-item-workflow="${item.workflow || ''}"
              data-item-tools="${(item.tools || []).join(', ')}"
              style="width: 54px; height: 54px; border-radius: 50%; background: rgba(255,255,255,0.92); border: none; cursor: pointer; color: var(--color-primary); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-lg); transition: transform 0.2s;"
              title="Play Video Reel"
            >
              <span class="material-symbols-outlined" style="font-size: 28px; margin-left: 2px;">play_arrow</span>
            </button>
          </div>

          <!-- Badges -->
          <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
            <span class="badge badge-primary" style="font-size: 10px;">${item.badge || 'Commercial License Available'}</span>
            <span class="badge" style="background: rgba(0,0,0,0.7); color: #fff; font-size: 10px;">${item.aspectRatio}</span>
          </div>

          <div style="position: absolute; bottom: 12px; right: 12px;">
            <span class="badge" style="background: rgba(255,255,255,0.9); color: var(--color-on-surface); font-size: 10px;">${item.clientBadge || 'Client Work'}</span>
          </div>
        </div>

        <!-- Details -->
        <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <h3 class="font-headline-sm" style="color: var(--color-on-surface); margin-bottom: 0.35rem; font-size: 19px;">
              ${item.title}
            </h3>
            <p class="font-body-sm" style="color: var(--color-on-surface-variant); line-height: 1.55;">
              ${item.subtitle}
            </p>
          </div>

          <!-- Workflow Breakdown Box -->
          <div style="background: var(--color-surface-container-low); padding: 0.85rem; border-radius: var(--radius-md); font-size: 12.5px; display: flex; flex-direction: column; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span class="font-label-tag" style="color: var(--color-on-surface-variant); font-size: 10px;">Tools & Models:</span>
              <span style="font-weight: 600; color: var(--color-primary);">${(item.tools || []).join(' • ')}</span>
            </div>
            <div>
              <span class="font-label-tag" style="color: var(--color-on-surface-variant); font-size: 10px; display: block; margin-bottom: 2px;">Workflow Breakdown:</span>
              <span style="color: var(--color-on-surface); line-height: 1.45;">${item.workflow || 'Midjourney concepting → Temporal video pass → Final grade'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Action Footer -->
      <div style="padding: 1.5rem; padding-top: 0; border-top: 1px solid var(--color-surface-container); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; font-size: 12.5px;">
        <span class="font-label-tag" style="color: var(--color-secondary); font-size: 11px;">Output: ${item.output || '4K ProRes'}</span>
        <button 
          class="breakdown-modal-trigger" 
          data-item-title="${item.title}" 
          data-item-workflow="${item.workflow}"
          data-item-tools="${(item.tools || []).join(', ')}"
          data-item-output="${item.output}"
          style="background: none; border: none; cursor: pointer; color: var(--color-primary); font-weight: 600; display: flex; align-items: center; gap: 2px;"
        >
          <span>View Breakdown</span>
          <span class="material-symbols-outlined" style="font-size: 15px;">arrow_forward</span>
        </button>
      </div>
    </article>
  `;
}

export function initCreatorProfileLogic(creatorId = 'elena-vance') {
  const creator = store.getCreator(creatorId) || store.getCreator('elena-vance');
  if (!creator) return;

  // Bookmark Toggle
  const bookmarkBtn = document.getElementById('profile-bookmark-btn');
  if (bookmarkBtn) {
    bookmarkBtn.onclick = () => {
      const nowSaved = store.toggleBookmark(creator.id);
      if (nowSaved) {
        bookmarkBtn.innerHTML = `
          <span class="material-symbols-outlined" style="font-size: 19px;">bookmark</span>
          <span>Bookmarked in Shortlist</span>
        `;
        showToast(`Saved ${creator.name} to company shortlist`, 'bookmark');
      } else {
        bookmarkBtn.innerHTML = `
          <span class="material-symbols-outlined" style="font-size: 19px;">bookmark_border</span>
          <span>Bookmark Creator</span>
        `;
        showToast(`Removed ${creator.name} from shortlist`, 'bookmark_border');
      }
    };
  }

  // Share Button
  const shareBtn = document.getElementById('profile-share-btn');
  if (shareBtn) {
    shareBtn.onclick = () => {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Profile link copied to clipboard', 'content_copy');
    };
  }

  // Contact Modal
  const openContact = (defaultPackage = '') => {
    openModal({
      title: `Contact ${creator.name}`,
      subtitle: `Inquire about custom video productions, spec briefs, or commission packages.`,
      contentHtml: `
        <form id="contact-creator-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label class="font-label-tag" style="display: block; margin-bottom: 0.35rem; color: var(--color-primary);">Your Name / Studio</label>
            <input type="text" class="input" required placeholder="e.g. Aura Studios / Creative Director" value="Aura Studios" />
          </div>
          <div>
            <label class="font-label-tag" style="display: block; margin-bottom: 0.35rem; color: var(--color-primary);">Work Email</label>
            <input type="email" class="input" required placeholder="director@aurastudios.com" value="producer@aurastudios.com" />
          </div>
          <div>
            <label class="font-label-tag" style="display: block; margin-bottom: 0.35rem; color: var(--color-primary);">Subject / Package</label>
            <input type="text" class="input" value="${defaultPackage ? `Commission Inquiry: ${defaultPackage}` : `Creative Project Inquiry for ${creator.name}`}" />
          </div>
          <div>
            <label class="font-label-tag" style="display: block; margin-bottom: 0.35rem; color: var(--color-primary);">Project Brief / Narrative Notes</label>
            <textarea class="textarea" rows="4" placeholder="Briefly describe your deliverables, timeline, and aesthetic requirements...">Hello Elena, we loved your work on Aura Borealis and would like to discuss commissioning a 60s teaser for our upcoming product launch.</textarea>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
            <button type="button" class="btn btn-outline" onclick="if (window.closeModal) window.closeModal(); else document.getElementById('active-modal-backdrop')?.remove();">Cancel</button>
            <button type="submit" class="btn btn-primary">Send Direct Inquiry</button>
          </div>
        </form>
      `
    });

    const form = document.getElementById('contact-creator-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        if (window.closeModal) window.closeModal(); else document.getElementById('active-modal-backdrop')?.remove();
        showToast(`Inquiry sent directly to ${creator.name}! Expected response within 24h.`, 'mark_email_read');
      };
    }
  };

  const contactBtn = document.getElementById('profile-contact-btn');
  if (contactBtn) contactBtn.onclick = () => openContact();

  const directEmailBtn = document.getElementById('direct-email-btn');
  if (directEmailBtn) directEmailBtn.onclick = () => openContact();

  // Commission Package Buttons
  document.querySelectorAll('.commission-pkg-btn').forEach(btn => {
    btn.onclick = () => {
      const pkgTitle = btn.dataset.pkgTitle;
      const pkgPrice = btn.dataset.pkgPrice;
      openContact(`${pkgTitle} (${pkgPrice})`);
    };
  });

  // Portfolio Tabs
  document.querySelectorAll('.portfolio-tab-btn').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.portfolio-tab-btn').forEach(t => {
        t.style.background = 'transparent';
        t.style.color = 'var(--color-on-surface-variant)';
        t.style.boxShadow = 'none';
        t.classList.remove('active');
      });
      tab.style.background = '#fff';
      tab.style.color = 'var(--color-primary)';
      tab.style.boxShadow = 'var(--shadow-sm)';
      tab.classList.add('active');

      const filterType = tab.dataset.tab;
      document.querySelectorAll('.portfolio-card').forEach(card => {
        if (filterType === 'all' || card.dataset.category === filterType) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    };
  });

  // Video Reel Player Simulation Modal
  document.querySelectorAll('.play-reel-trigger-btn').forEach(btn => {
    btn.onclick = () => {
      const title = btn.dataset.itemTitle;
      const img = btn.dataset.itemImg;
      const workflow = btn.dataset.itemWorkflow;
      const tools = btn.dataset.itemTools;

      openModal({
        title: title,
        subtitle: `Curated AI Reel Preview • Directed by ${creator.name}`,
        maxWidth: '720px',
        contentHtml: `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="position: relative; aspect-ratio: 16/9; border-radius: var(--radius-md); overflow: hidden; background: #000;">
              <img src="${img}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff;">
                <span class="material-symbols-outlined" style="font-size: 64px; color: var(--color-secondary-gold); animation: pulse 2s infinite;">play_circle</span>
                <span class="font-label-md" style="margin-top: 0.5rem; letter-spacing: 0.08em; text-transform: uppercase;">Simulated 4K ProRes Video Stream</span>
              </div>
            </div>
            <div style="background: var(--color-surface-container-low); padding: 1rem; border-radius: var(--radius-md); font-size: 13px;">
              <div style="font-weight: 600; color: var(--color-primary); margin-bottom: 0.25rem;">Generation Tools: ${tools}</div>
              <div style="color: var(--color-on-surface-variant);">${workflow}</div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
              <button class="btn btn-outline" onclick="if (window.closeModal) window.closeModal(); else document.getElementById('active-modal-backdrop')?.remove();">Close Preview</button>
              <button class="btn btn-primary" onclick="if (window.closeModal) window.closeModal(); else document.getElementById('active-modal-backdrop')?.remove(); document.getElementById('profile-contact-btn')?.click();">Commission Project</button>
            </div>
          </div>
        `
      });
    };
  });

  // Breakdown Modal
  document.querySelectorAll('.breakdown-modal-trigger').forEach(btn => {
    btn.onclick = () => {
      const title = btn.dataset.itemTitle;
      const workflow = btn.dataset.itemWorkflow;
      const tools = btn.dataset.itemTools;
      const output = btn.dataset.itemOutput;

      openModal({
        title: `Technical Breakdown — ${title}`,
        subtitle: `Neural Production Pipeline by ${creator.name}`,
        contentHtml: `
          <div style="display: flex; flex-direction: column; gap: 1.25rem; font-size: 13.5px;">
            <div class="card" style="padding: 1rem; background: var(--color-surface-container-low);">
              <span class="font-label-tag" style="color: var(--color-primary); display: block; margin-bottom: 0.25rem;">Pipeline Steps</span>
              <p style="margin: 0; line-height: 1.5; color: var(--color-on-surface);">${workflow}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="card" style="padding: 1rem;">
                <span class="font-label-tag" style="color: var(--color-outline); display: block; margin-bottom: 0.25rem;">Models Used</span>
                <strong style="color: var(--color-primary);">${tools}</strong>
              </div>
              <div class="card" style="padding: 1rem;">
                <span class="font-label-tag" style="color: var(--color-outline); display: block; margin-bottom: 0.25rem;">Master Output</span>
                <strong style="color: var(--color-secondary);">${output}</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end;">
              <button class="btn btn-primary" onclick="if (window.closeModal) window.closeModal(); else document.getElementById('active-modal-backdrop')?.remove();">Got It</button>
            </div>
          </div>
        `
      });
    };
  });
}
