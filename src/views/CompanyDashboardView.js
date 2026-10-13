// Screen 4: Company Dashboard — Active Briefs & Shortlisted Talent (MVP)
import { store } from '../data/store.js';
import { showToast } from '../components/Toast.js';
import { openModal } from '../components/Modal.js';

export function renderCompanyDashboardView() {
  const briefs = store.getBriefs();
  const shortlisted = store.getShortlistedCreators();
  const allProposals = store.getProposals();

  const activeBriefsCount = briefs.filter(b => b.status !== 'draft').length;
  const proposalsCount = allProposals.length;
  const totalBudget = briefs.reduce((acc, b) => acc + (b.budgetAmount || 5000), 0);

  return `
    <div class="company-dashboard-page" style="padding-top: 1.5rem; padding-bottom: 5rem;">
      <!-- Dashboard Metric Cards Strip -->
      <section class="container-max" style="margin-bottom: 2.5rem;">
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); display: inline-block;"></span>
                <span class="font-label-tag" style="color: var(--color-primary); letter-spacing: 0.15em;">Studio Management</span>
              </div>
              <h1 class="font-display-hero" style="margin: 0; font-size: clamp(28px, 3.5vw, 44px);">Company Dashboard</h1>
              <p class="font-body-md" style="margin: 0; color: var(--color-on-surface-variant);">
                Track active creative briefs, evaluate incoming director treatments, and manage your shortlisted creators.
              </p>
            </div>

            <a href="#post-brief" class="btn btn-primary" style="padding: 0.65rem 1.5rem;">
              <span class="material-symbols-outlined" style="font-size: 18px;">add_box</span>
              <span>Post New Brief</span>
            </a>
          </div>

          <!-- 4 Metrics Row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
            <!-- Metric 1: Active Briefs -->
            <div class="card card-lift" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span class="font-label-md" style="color: var(--color-on-surface-variant); text-transform: uppercase;">Active Briefs</span>
                <span style="background: rgba(192, 237, 212, 0.4); color: var(--color-primary); padding: 6px; border-radius: var(--radius-sm); display: flex;">
                  <span class="material-symbols-outlined" style="font-size: 20px;">movie_filter</span>
                </span>
              </div>
              <div style="margin-top: 1rem;">
                <div style="display: flex; align-items: baseline; gap: 0.5rem;">
                  <span class="font-headline-md" style="color: var(--color-on-surface); font-weight: 700; font-size: 32px;">${activeBriefsCount}</span>
                  <span class="font-label-tag" style="color: var(--color-primary-container); font-weight: 700;">Active Projects</span>
                </div>
                <span class="font-body-sm" style="color: var(--color-outline); font-size: 12px; margin-top: 2px; display: block;">In production or pitching</span>
              </div>
            </div>

            <!-- Metric 2: Received Proposals -->
            <div class="card card-lift" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span class="font-label-md" style="color: var(--color-on-surface-variant); text-transform: uppercase;">Received Proposals</span>
                <span style="background: rgba(255, 221, 183, 0.5); color: var(--color-secondary); padding: 6px; border-radius: var(--radius-sm); display: flex;">
                  <span class="material-symbols-outlined" style="font-size: 20px;">rate_review</span>
                </span>
              </div>
              <div style="margin-top: 1rem;">
                <div style="display: flex; align-items: baseline; gap: 0.5rem;">
                  <span class="font-headline-md" style="color: var(--color-on-surface); font-weight: 700; font-size: 32px;">${proposalsCount}</span>
                  <span class="font-label-tag" style="color: var(--color-secondary); font-weight: 700;">Director Pitches</span>
                </div>
                <span class="font-body-sm" style="color: var(--color-outline); font-size: 12px; margin-top: 2px; display: block;">Awaiting creator review</span>
              </div>
            </div>

            <!-- Metric 3: Saved Creators -->
            <div class="card card-lift" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span class="font-label-md" style="color: var(--color-on-surface-variant); text-transform: uppercase;">Saved Creators</span>
                <span style="background: var(--color-surface-container-high); color: var(--color-on-surface-variant); padding: 6px; border-radius: var(--radius-sm); display: flex;">
                  <span class="material-symbols-outlined" style="font-size: 20px;">bookmark</span>
                </span>
              </div>
              <div style="margin-top: 1rem;">
                <div style="display: flex; align-items: baseline; gap: 0.5rem;">
                  <span class="font-headline-md" style="color: var(--color-on-surface); font-weight: 700; font-size: 32px;" id="dash-shortlist-count">${shortlisted.length}</span>
                  <span class="font-label-tag" style="color: var(--color-on-surface-variant); font-weight: 700;">Shortlisted</span>
                </div>
                <span class="font-body-sm" style="color: var(--color-outline); font-size: 12px; margin-top: 2px; display: block;">Bookmarked for future briefs</span>
              </div>
            </div>

            <!-- Metric 4: Total Project Budget -->
            <div class="card card-lift" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span class="font-label-md" style="color: var(--color-on-surface-variant); text-transform: uppercase;">Allocated Budget</span>
                <span style="background: rgba(192, 237, 212, 0.4); color: var(--color-primary); padding: 6px; border-radius: var(--radius-sm); display: flex;">
                  <span class="material-symbols-outlined" style="font-size: 20px;">account_balance_wallet</span>
                </span>
              </div>
              <div style="margin-top: 1rem;">
                <div style="display: flex; align-items: baseline; gap: 0.5rem;">
                  <span class="font-headline-md" style="color: var(--color-primary); font-weight: 700; font-size: 32px;">$${totalBudget.toLocaleString()}</span>
                </div>
                <span class="font-body-sm" style="color: var(--color-outline); font-size: 12px; margin-top: 2px; display: block;">Across all active studio briefs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Workspace (Active Briefs vs Shortlisted Talent) -->
      <section class="container-max">
        <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 2rem; align-items: start;">
          <!-- LEFT SECTION: Active Creative Briefs (8 cols) -->
          <div style="grid-column: span 12;" id="dash-left-col">
            <style>
              @media (min-width: 1024px) {
                #dash-left-col { grid-column: span 8 !important; }
                #dash-right-col { grid-column: span 4 !important; }
              }
            </style>

            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background: var(--color-primary);"></span>
                    <span class="font-label-tag" style="color: var(--color-outline);">Studio Overview</span>
                  </div>
                  <h2 class="font-headline-md" style="color: var(--color-on-surface); margin: 0.25rem 0 0;">Active Creative Briefs</h2>
                </div>
                <span class="font-body-sm" style="color: var(--color-on-surface-variant);">${briefs.length} briefs in pipeline</span>
              </div>

              <!-- Briefs List -->
              <div style="display: flex; flex-direction: column; gap: 1.25rem;" id="dashboard-briefs-list">
                ${briefs.map(b => renderDashboardBriefCard(b)).join('')}
              </div>
            </div>
          </div>

          <!-- RIGHT SECTION: Shortlisted Talent (4 cols) -->
          <aside style="grid-column: span 12; display: flex; flex-direction: column; gap: 1.25rem;" id="dash-right-col">
            <div class="card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size: 22px;">bookmark</span>
                <div>
                  <h3 class="font-title-editorial" style="margin: 0; color: var(--color-on-surface); font-size: 17px;">Shortlisted Talent</h3>
                  <span class="font-body-sm" style="font-size: 11.5px; color: var(--color-on-surface-variant);">Clean roster for quick assignment</span>
                </div>
              </div>
              <span class="badge badge-primary" id="shortlist-pill-badge">${shortlisted.length} Saved</span>
            </div>

            <!-- Shortlist Cards Container -->
            <div style="display: flex; flex-direction: column; gap: 0.85rem;" id="dash-shortlist-container">
              ${shortlisted.length === 0 ? `
                <div class="card" style="padding: 2rem; text-align: center; color: var(--color-outline);">
                  <span class="material-symbols-outlined" style="font-size: 32px; margin-bottom: 0.5rem;">bookmark_border</span>
                  <div class="font-body-sm">No creators shortlisted yet.</div>
                  <a href="#explore" class="btn btn-outline" style="margin-top: 0.75rem; font-size: 12px; padding: 0.4rem 0.85rem;">Browse Roster</a>
                </div>
              ` : shortlisted.map(creator => `
                <div class="card card-lift" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;" id="dash-creator-${creator.id}">
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <img 
                      src="${creator.avatar}" 
                      alt="${creator.name}" 
                      style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover; shrink-0;"
                    />
                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 class="font-title-editorial" style="margin: 0; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                          <a href="#profile/${creator.id}" class="hover-underline" style="color: var(--color-on-surface);">${creator.name}</a>
                        </h4>
                        <span class="material-symbols-outlined" style="color: var(--color-secondary-gold); font-size: 16px;">verified</span>
                      </div>
                      <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px; display: block; margin-top: 1px;">
                        ${creator.discipline}
                      </span>
                      <div style="margin-top: 4px;">
                        <span class="badge ${creator.availability === 'Available Now' ? 'badge-primary' : 'badge-neutral'}" style="font-size: 9.5px; padding: 1px 6px;">
                          ${creator.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style="border-top: 1px solid var(--color-surface-container); padding-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <span style="color: var(--color-outline); font-size: 11px;">${creator.tools.slice(0, 2).join(' • ')}</span>
                    <a href="#profile/${creator.id}" style="color: var(--color-primary); font-weight: 700; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.05em;" class="hover-underline">
                      View Profile
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Need More Talent Helper Box -->
            <div class="card" style="padding: 1.25rem; text-align: center; background: var(--color-surface-container-low); display: flex; flex-direction: column; gap: 0.5rem;">
              <span class="font-label-tag" style="color: var(--color-outline); letter-spacing: 0.08em;">Need more talent?</span>
              <p class="font-body-sm" style="color: var(--color-on-surface-variant); font-size: 12.5px; margin: 0;">
                Browse curated portfolios, style tags, and filter by neural models.
              </p>
              <a href="#explore" class="btn btn-outline" style="background: #fff; font-size: 13px; margin-top: 0.5rem;">
                Explore All Creators
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  `;
}

function renderDashboardBriefCard(b) {
  const isDraft = (b.status === 'draft');
  const inProd = (b.status === 'in_production');

  let statusBadgeClass = 'badge-primary';
  if (isDraft) statusBadgeClass = 'badge-neutral';
  else if (inProd) statusBadgeClass = 'badge-secondary';

  return `
    <article class="card card-lift" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; position: relative;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 0.4rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge ${statusBadgeClass}" style="font-size: 10.5px;">
              ${b.statusLabel || (isDraft ? 'Draft' : 'Reviewing Pitches')}
            </span>
            <span class="font-label-tag" style="color: var(--color-secondary); display: flex; align-items: center; gap: 3px;">
              <span class="material-symbols-outlined" style="font-size: 14px;">schedule</span>
              <span>Due: ${b.deadlineFormatted || b.deadline || 'Nov 1'}</span>
            </span>
          </div>

          <h3 class="font-title-editorial" style="color: var(--color-primary); font-size: 20px; margin: 0;">
            <a href="#brief/${b.id}" class="hover-underline" style="color: inherit;">${b.title}</a>
          </h3>

          <p class="font-body-md" style="color: var(--color-on-surface-variant); line-height: 1.5; margin: 0; max-width: 780px;">
            ${b.description}
          </p>
        </div>

        <div style="text-align: right; shrink-0;">
          <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px; display: block;">Budget</span>
          <span class="font-headline-md" style="color: var(--color-on-surface); font-weight: 700;">$${(b.budgetAmount || 5000).toLocaleString()}</span>
        </div>
      </div>

      <!-- In Production Special Progress Strip -->
      ${inProd ? `
        <div style="background: var(--color-surface-container-low); padding: 0.75rem 1rem; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 12.5px;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 18px;">inventory_2</span>
            <span style="font-weight: 600; color: var(--color-on-surface);">Deliverables:</span>
            <span class="badge badge-outline" style="font-size: 10px;">${b.deliverables?.[0] || '24 Stills + 3 Motion Loops'}</span>
          </div>
          <span class="font-label-tag" style="color: var(--color-secondary); font-weight: 700;">Production on schedule</span>
        </div>
      ` : ''}

      <!-- Actions Row -->
      <div style="border-top: 1px solid var(--color-surface-container); padding-top: 0.85rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 13px; color: var(--color-on-surface-variant);">
          ${inProd && b.assignedCreatorName ? `
            <img src="${b.assignedCreatorAvatar}" alt="${b.assignedCreatorName}" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover;" />
            <span>Assigned: <strong style="color: var(--color-primary);">${b.assignedCreatorName}</strong></span>
          ` : `
            <span class="material-symbols-outlined" style="font-size: 17px; color: var(--color-primary);">groups</span>
            <span>${b.proposalsCount || 3} proposals ready for review</span>
          `}
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <a href="#brief/${b.id}" class="btn btn-outline" style="font-size: 12.5px; padding: 0.45rem 0.85rem;">
            Edit Brief
          </a>
          <a href="#brief/${b.id}" class="btn btn-primary" style="font-size: 12.5px; padding: 0.45rem 1rem;">
            <span>View Brief & Recommendations</span>
            <span class="material-symbols-outlined" style="font-size: 16px;">arrow_forward</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

export function initCompanyDashboardLogic() {
  // Real-time synchronization
  store.subscribe(() => {
    const list = document.getElementById('dashboard-briefs-list');
    if (list) {
      list.innerHTML = store.getBriefs().map(b => renderDashboardBriefCard(b)).join('');
    }
  });
}
