// Screen 4: Company Dashboard — Active Briefs, Brand Identity & Shortlisted Talent
import { store } from '../data/store.js';
import { showToast } from '../components/Toast.js';
import { openModal } from '../components/Modal.js';
import { profileApi, invitationApi, auth } from '../api.js';

export function renderCompanyDashboardView() {
  const briefs = store.getBriefs();
  const shortlisted = store.getShortlistedCreators();
  const allProposals = store.getProposals();
  const user = auth.getUser();

  const activeBriefsCount = briefs.filter(b => b.status !== 'draft').length;
  const proposalsCount = allProposals.length;
  const totalBudget = briefs.reduce((acc, b) => acc + (b.budgetAmount || 5000), 0);

  // Brand profile info (Aura Studios or authenticated brand)
  let savedLogo = null;
  try { savedLogo = localStorage.getItem('atelier_brand_logo_v1'); } catch {}
  const orgName = user?.role === 'brand' ? (user.full_name || 'Aura Studios') : 'Aura Studios';
  const industry = 'Automotive & Luxury Cinema';
  const website = 'https://aurastudios.design';
  const initials = orgName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AS';

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

          <!-- Brand Organization Identity & Logo Section -->
          <div class="card" style="padding: 1.5rem 2rem; background: var(--color-surface-container-low); border: 1.5px solid var(--color-secondary-gold); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <div id="brand-logo-preview-box" style="width: 76px; height: 76px; border-radius: var(--radius-md); overflow: hidden; background: var(--color-primary); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border: 2px solid var(--color-secondary-gold); flex-shrink: 0; position: relative;">
                ${savedLogo ? `
                  <img id="brand-logo-img" src="${savedLogo}" alt="${orgName}" style="width: 100%; height: 100%; object-fit: contain; padding: 4px; background: #fff;" />
                ` : `
                  <span id="brand-logo-initials" style="font-size: 26px; font-weight: 700; color: var(--color-secondary-gold); letter-spacing: 0.05em;">${initials}</span>
                `}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; flex-wrap: wrap;">
                  <span class="badge badge-secondary" style="font-size: 10.5px;">Verified Organization</span>
                  <span class="font-label-tag" style="color: var(--color-outline); font-size: 11px;">${industry}</span>
                </div>
                <h2 class="font-headline-sm" style="color: var(--color-primary); margin: 0 0 0.25rem 0; font-size: 20px;">
                  ${orgName}
                </h2>
                <p class="font-body-sm" style="color: var(--color-outline); margin: 0; font-size: 12.5px;">
                  <a href="${website}" target="_blank" style="color: var(--color-secondary); text-decoration: underline; margin-right: 8px;">${website}</a>
                  Commercial studio commissioning computational cinema and generative visual campaigns.
                </p>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <input type="file" id="brand-logo-file-input" accept="image/jpeg,image/png,image/webp,image/gif" style="display: none;" />
              <button type="button" id="trigger-brand-logo-btn" class="btn btn-primary" style="font-size: 13px; padding: 0.55rem 1.25rem;">
                <span class="material-symbols-outlined" style="font-size: 17px;">upload</span>
                <span>${savedLogo ? 'Replace Logo' : 'Upload Brand Logo'}</span>
              </button>
              ${savedLogo ? `
                <button type="button" id="remove-brand-logo-btn" class="btn btn-outline" style="font-size: 13px; padding: 0.55rem 0.9rem; color: var(--color-error); border-color: rgba(186,26,26,0.3);">
                  <span class="material-symbols-outlined" style="font-size: 17px;">delete</span>
                  <span>Remove</span>
                </button>
              ` : ''}
              <div id="brand-logo-status" style="display: none; font-size: 12px; color: var(--color-primary); font-weight: 600; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 16px; animation: spin 1s linear infinite;">autorenew</span>
                <span>Uploading logo…</span>
              </div>
            </div>
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
                  <span class="font-headline-md" style="color: var(--color-on-surface); font-weight: 700; font-size: 32px;">$${totalBudget.toLocaleString()}</span>
                  <span class="font-label-tag" style="color: var(--color-primary-container); font-weight: 700;">USD</span>
                </div>
                <span class="font-body-sm" style="color: var(--color-outline); font-size: 12px; margin-top: 2px; display: block;">Committed & estimated spend</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Layout: Active Briefs Pipeline (8 cols) & Shortlisted Talent (4 cols) -->
      <section class="container-max">
        <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 2rem; align-items: flex-start;">
          
          <!-- LEFT SECTION: Active Creative Briefs (8 cols) -->
          <div style="grid-column: span 12; display: flex; flex-direction: column; gap: 2rem;" id="dash-left-col">
            <style>
              @media (min-width: 1024px) {
                #dash-left-col { grid-column: span 8 !important; }
                #dash-right-col { grid-column: span 4 !important; }
              }
            </style>

            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <h2 class="font-headline-sm" style="color: var(--color-primary); margin: 0;">Active Creative Briefs</h2>
                  <span class="badge badge-primary" style="font-size: 11px;">Studio Pipeline</span>
                </div>
                <span class="font-body-sm" style="color: var(--color-on-surface-variant);">${briefs.length} briefs in pipeline</span>
              </div>

              <!-- Briefs List -->
              <div style="display: flex; flex-direction: column; gap: 1.25rem;" id="dashboard-briefs-list">
                ${briefs.map(b => renderDashboardBriefCard(b)).join('')}
              </div>
            </div>

            <!-- Sent Talent Invitations Panel -->
            <div style="display: flex; flex-direction: column; gap: 1.25rem; border-top: 1px solid var(--color-surface-container); padding-top: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <h2 class="font-headline-sm" style="color: var(--color-primary); margin: 0;">Talent Invitations Sent</h2>
                  <span class="badge badge-secondary" style="font-size: 11px;">Pitch Outreach</span>
                </div>
                <span class="font-body-sm" style="color: var(--color-outline);" id="sent-invitations-count">Checking invitations…</span>
              </div>

              <div id="sent-invitations-list" style="display: flex; flex-direction: column; gap: 0.85rem;">
                <div style="text-align: center; padding: 2rem; color: var(--color-outline);">
                  <span class="material-symbols-outlined" style="font-size: 32px; animation: spin 1s linear infinite; display: block; margin-bottom: 0.5rem;">autorenew</span>
                  Loading sent invitations…
                </div>
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
                      style="width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0;"
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

        <div style="text-align: right; flex-shrink: 0;">
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
  // Real-time synchronization for briefs list
  store.subscribe(() => {
    const list = document.getElementById('dashboard-briefs-list');
    if (list) {
      list.innerHTML = store.getBriefs().map(b => renderDashboardBriefCard(b)).join('');
    }
  });

  // Organization Logo Upload Wiring
  const triggerLogoBtn = document.getElementById('trigger-brand-logo-btn');
  const logoFileInput = document.getElementById('brand-logo-file-input');
  const removeLogoBtn = document.getElementById('remove-brand-logo-btn');
  const logoStatus = document.getElementById('brand-logo-status');
  const previewBox = document.getElementById('brand-logo-preview-box');

  if (triggerLogoBtn && logoFileInput) {
    triggerLogoBtn.onclick = () => logoFileInput.click();

    logoFileInput.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (re) => {
        if (previewBox) {
          previewBox.innerHTML = `<img src="${re.target.result}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; padding: 4px; background: #fff;" />`;
        }
      };
      reader.readAsDataURL(file);

      triggerLogoBtn.disabled = true;
      if (logoStatus) logoStatus.style.display = 'flex';

      try {
        let newUrl = null;
        if (auth.isLoggedIn()) {
          const res = await profileApi.uploadBrandLogo(file);
          newUrl = res.logo_url;
        } else {
          newUrl = await new Promise(res => {
            const r = new FileReader();
            r.onload = () => res(r.target.result);
            r.readAsDataURL(file);
          });
        }

        try { localStorage.setItem('atelier_brand_logo_v1', newUrl); } catch {}
        const currentUser = auth.getUser();
        if (currentUser) {
          auth.setUser({ ...currentUser, logo_url: newUrl, avatar_url: newUrl });
        }
        store.notify();
        showToast('Brand logo uploaded and updated!', 'check_circle', 4000);
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        console.error("Logo upload failed:", err);
        showToast(err.message || 'Failed to upload brand logo.', 'error');
      } finally {
        triggerLogoBtn.disabled = false;
        if (logoStatus) logoStatus.style.display = 'none';
      }
    };
  }

  if (removeLogoBtn) {
    removeLogoBtn.onclick = async () => {
      try {
        removeLogoBtn.disabled = true;
        if (auth.isLoggedIn()) {
          try { await profileApi.deleteBrandLogo(); } catch {}
        }
        try { localStorage.removeItem('atelier_brand_logo_v1'); } catch {}
        const currentUser = auth.getUser();
        if (currentUser) {
          const u = { ...currentUser };
          delete u.logo_url;
          delete u.avatar_url;
          auth.setUser(u);
        }
        store.notify();
        showToast('Brand logo removed.', 'info');
        setTimeout(() => window.location.reload(), 600);
      } catch (err) {
        showToast(err.message || 'Failed to remove logo', 'error');
        removeLogoBtn.disabled = false;
      }
    };
  }

  // Load Sent Invitations
  loadSentInvitations();
}

async function loadSentInvitations() {
  const container = document.getElementById('sent-invitations-list');
  const countEl = document.getElementById('sent-invitations-count');
  if (!container) return;

  try {
    let invitations = [];
    if (auth.isLoggedIn()) {
      invitations = await invitationApi.mine();
    }

    // Default seeded preview if user hasn't sent invitations yet
    if (!invitations || invitations.length === 0) {
      invitations = [
        {
          id: "inv-seed-1",
          campaign_title: "Solaar EV — Kinetic Horizon",
          creator_name: "Elena Vance",
          status: "pending",
          message: "Director Treatment Tender: 4-act coastal vehicle sequence with custom LoRA geometry passes.",
          created_at: new Date(Date.now() - 14400000).toISOString()
        },
        {
          id: "inv-seed-2",
          campaign_title: "Solaar EV — Kinetic Horizon",
          creator_name: "Kaelen Chen",
          status: "pending",
          message: "Aerodynamic Visual Pitch & Neural Wind Tunnel simulation.",
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "inv-seed-3",
          campaign_title: "Heritage Botanicals — Macro Bioluminescence",
          creator_name: "Studio Numen",
          status: "accepted",
          message: "Atmospheric European landscape focus blending wet reflections and optical flare passes.",
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
    }

    if (countEl) countEl.textContent = `${invitations.length} active outreach pitches`;

    container.innerHTML = invitations.map(inv => {
      const isAccepted = inv.status === 'accepted';
      const isPending = inv.status === 'pending';
      const badge = isPending 
        ? '<span class="badge badge-secondary" style="font-size: 10px;">Awaiting Creator</span>'
        : isAccepted
        ? '<span class="badge badge-primary" style="font-size: 10px;">Accepted • In Production</span>'
        : '<span class="badge badge-neutral" style="font-size: 10px;">Declined</span>';

      return `
        <div class="card card-lift" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              ${badge}
              <strong style="color: var(--color-primary); font-size: 14px;">${inv.creator_name || 'Shortlisted Creator'}</strong>
            </div>
            <p class="font-body-sm" style="color: var(--color-on-surface); margin: 0 0 0.25rem 0; font-weight: 600;">
              Campaign: ${inv.campaign_title || 'Commercial Project'}
            </p>
            ${inv.message ? `<p class="font-body-sm" style="color: var(--color-outline); margin: 0; font-size: 12px; max-width: 600px;">${inv.message}</p>` : ''}
          </div>
          <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px;">
            ${inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'Active'}
          </span>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.warn("Could not load sent invitations:", err);
    if (countEl) countEl.textContent = 'Active outreach';
  }
}
