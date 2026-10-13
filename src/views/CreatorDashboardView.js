// Creator Dashboard — active engagements, invitations, portfolio management, and profile editor
import { auth, invitationApi, engagementApi, profileApi, portfolioApi } from '../api.js';
import { store } from '../data/store.js';
import { showToast } from '../components/Toast.js';
import { openModal, closeModal } from '../components/Modal.js';

export function renderCreatorDashboardView() {
  const user = auth.getUser();
  const isLoggedIn = !!user;

  return `
    <div class="creator-dashboard-page" style="padding-top: 1.5rem; padding-bottom: 5rem;">
      <section class="container-max" style="margin-bottom: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); display: inline-block;"></span>
              <span class="font-label-tag" style="color: var(--color-primary); letter-spacing: 0.15em;">Creator Studio</span>
            </div>
            <h1 class="font-display-hero" style="margin: 0; font-size: clamp(26px, 3.5vw, 42px);">
              Welcome, ${user?.full_name || 'Creator'}
            </h1>
            <p class="font-body-md" style="margin: 0; color: var(--color-on-surface-variant);">
              Where AI Creativity Meets Brands — Manage your invitations, director treatments, and portfolio.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            ${isLoggedIn ? `
              <a href="#profile/elena-vance" class="btn btn-outline" style="padding: 0.65rem 1.25rem;">
                <span class="material-symbols-outlined" style="font-size: 18px;">visibility</span>
                <span>View Public Profile</span>
              </a>
            ` : ''}
            <a href="#explore" class="btn btn-primary" style="padding: 0.65rem 1.25rem;">
              <span class="material-symbols-outlined" style="font-size: 18px;">explore</span>
              <span>Browse Opportunities</span>
            </a>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <section class="container-max" style="margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 0; border-bottom: 2px solid var(--color-surface-container); overflow-x: auto;">
          ${['Invitations', 'Engagements', 'Portfolio Works', 'My Profile'].map((tab, i) => `
            <button class="creator-dash-tab ${i === 0 ? 'active' : ''}" data-tab="${i}"
              style="padding: 0.65rem 1.25rem; background: none; border: none; border-bottom: 2px solid ${i === 0 ? 'var(--color-primary)' : 'transparent'}; margin-bottom: -2px; cursor: pointer; font-size: 14px; font-weight: ${i === 0 ? '700' : '500'}; color: ${i === 0 ? 'var(--color-primary)' : 'var(--color-outline)'}; transition: all 0.2s; white-space: nowrap;">
              ${tab}
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Tab Panels -->
      <section class="container-max">
        <!-- Invitations Panel -->
        <div id="creator-panel-0">
          <div id="invitations-list" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; padding: 3rem; color: var(--color-outline);">
              <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.5rem; animation: spin 1s linear infinite;">autorenew</span>
              Loading invitations…
            </div>
          </div>
        </div>

        <!-- Engagements Panel -->
        <div id="creator-panel-1" style="display: none;">
          <div id="engagements-list" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; padding: 3rem; color: var(--color-outline);">
              <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.5rem; animation: spin 1s linear infinite;">autorenew</span>
              Loading engagements…
            </div>
          </div>
        </div>

        <!-- Portfolio Panel -->
        <div id="creator-panel-2" style="display: none;">
          <div id="creator-portfolio-manager" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="text-align: center; padding: 3rem; color: var(--color-outline);">
              <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.5rem; animation: spin 1s linear infinite;">autorenew</span>
              Loading portfolio works…
            </div>
          </div>
        </div>

        <!-- Profile Panel -->
        <div id="creator-panel-3" style="display: none;">
          <div id="creator-profile-editor" class="card" style="padding: 2rem; max-width: 800px;">
            <div style="text-align: center; padding: 2rem; color: var(--color-outline);">
              <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.5rem; animation: spin 1s linear infinite;">autorenew</span>
              Loading profile…
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export async function initCreatorDashboardLogic() {
  // Tab switching
  document.querySelectorAll('.creator-dash-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.creator-dash-tab').forEach((b, i) => {
        b.style.borderBottomColor = 'transparent';
        b.style.color = 'var(--color-outline)';
        b.style.fontWeight = '500';
        const panel = document.getElementById(`creator-panel-${i}`);
        if (panel) panel.style.display = 'none';
      });
      const idx = parseInt(btn.dataset.tab);
      btn.style.borderBottomColor = 'var(--color-primary)';
      btn.style.color = 'var(--color-primary)';
      btn.style.fontWeight = '700';
      const activePanel = document.getElementById(`creator-panel-${idx}`);
      if (activePanel) activePanel.style.display = 'block';
    });
  });

  await loadInvitations();
  await loadEngagements();
  await loadPortfolioWorks();
  await loadCreatorProfileEditor();
}

async function loadInvitations() {
  const container = document.getElementById('invitations-list');
  if (!container) return;

  if (!auth.isLoggedIn()) {
    container.innerHTML = `
      <div class="card" style="padding: 3rem 2rem; text-align: center; max-width: 580px; margin: 1rem auto; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
        <span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-primary);">badge</span>
        <h3 class="font-headline-sm" style="color: var(--color-primary); margin: 0;">Creator Sign In Required</h3>
        <p class="font-body-md" style="color: var(--color-on-surface-variant); margin: 0; line-height: 1.5;">
          Sign in as a creator to review confidential commercial brief invitations, pitch director treatments, and track tender statuses.
        </p>
        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
          <a href="#login" class="btn btn-primary" style="padding: 0.6rem 1.4rem;">Sign In</a>
          <a href="#register" class="btn btn-outline" style="padding: 0.6rem 1.4rem;">Join as Creator</a>
        </div>
      </div>
    `;
    return;
  }

  try {
    const invitations = await invitationApi.mine();
    if (!invitations || invitations.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 3.5rem 1.5rem; color: var(--color-outline); border: 1px dashed var(--color-outline-variant);">
          <span class="material-symbols-outlined" style="font-size: 44px; display: block; margin-bottom: 0.75rem; color: var(--color-primary);">mark_email_unread</span>
          <h3 class="font-headline-sm" style="color: var(--color-on-surface); margin-bottom: 0.35rem;">No Active Invitations</h3>
          <p class="font-body-md" style="margin: 0 auto; max-width: 480px; color: var(--color-on-surface-variant);">
            Brands will send formal pitch invitations and director treatment tenders directly to your studio pipeline when matching briefs are published.
          </p>
        </div>`;
      return;
    }

    container.innerHTML = invitations.map(inv => {
      const isPending = inv.status === 'pending';
      const isAccepted = inv.status === 'accepted';
      const statusBadge = isPending 
        ? '<span class="badge badge-secondary" style="font-size: 11px;">Pending Response</span>' 
        : isAccepted 
        ? '<span class="badge badge-primary" style="font-size: 11px;">Accepted • In Production</span>' 
        : '<span class="badge badge-neutral" style="font-size: 11px;">Declined</span>';

      const createdDate = inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

      return `
        <div class="card card-lift" style="padding: 1.75rem; display: flex; flex-direction: column; gap: 1rem; border: 1px solid var(--color-outline-variant);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
                ${statusBadge}
                <span class="font-label-tag" style="color: var(--color-outline); font-size: 11px;">Sent ${createdDate}</span>
              </div>
              <h3 class="font-headline-sm" style="color: var(--color-primary); margin: 0 0 0.25rem 0;">
                ${inv.campaign_title || 'Campaign Pitch Invitation'}
              </h3>
              <p class="font-label-md" style="color: var(--color-secondary); margin: 0;">
                Commissioning Studio: <strong>${inv.brand_name || 'Brand Partner'}</strong>
              </p>
            </div>

            ${isPending ? `
              <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                <button class="btn btn-outline inv-reject-btn" data-id="${inv.id}" style="padding: 0.5rem 1rem; font-size: 13px;">
                  Decline
                </button>
                <button class="btn btn-primary inv-accept-btn" data-id="${inv.id}" style="padding: 0.5rem 1.25rem; font-size: 13px;">
                  <span class="material-symbols-outlined" style="font-size: 16px;">task_alt</span>
                  <span>Accept Invitation</span>
                </button>
              </div>
            ` : `
              <span class="font-label-tag" style="color: var(--color-outline); align-self: center;">
                ${isAccepted ? 'Project active in production pipeline' : 'Invitation closed'}
              </span>
            `}
          </div>

          ${inv.message ? `
            <div style="background: var(--color-surface-container-low); padding: 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--color-primary);">
              <span class="font-label-tag" style="color: var(--color-outline); display: block; margin-bottom: 0.25rem;">Pitch Scope & Notes</span>
              <p class="font-body-md" style="margin: 0; color: var(--color-on-surface); font-size: 13.5px; line-height: 1.55;">
                ${inv.message}
              </p>
            </div>
          ` : ''}

          <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--color-surface-container); padding-top: 0.75rem;">
            <a href="#brief/${inv.campaign_id}" class="btn btn-surface" style="font-size: 12.5px; padding: 0.35rem 0.85rem;">
              <span>Inspect Campaign Brief</span>
              <span class="material-symbols-outlined" style="font-size: 16px;">arrow_forward</span>
            </a>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.inv-accept-btn').forEach(btn => {
      btn.onclick = async () => {
        try {
          btn.disabled = true;
          btn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px; animation: spin 1s linear infinite;">autorenew</span> Accepting…`;
          await invitationApi.respond(btn.dataset.id, 'accepted');
          showToast('Invitation accepted! Project is now active in your engagements.', 'task_alt', 4000);
          await loadInvitations();
          await loadEngagements();
        } catch (e) {
          showToast(e.message || 'Failed to accept invitation', 'error');
          btn.disabled = false;
          btn.textContent = 'Accept Invitation';
        }
      };
    });

    container.querySelectorAll('.inv-reject-btn').forEach(btn => {
      btn.onclick = async () => {
        try {
          btn.disabled = true;
          await invitationApi.respond(btn.dataset.id, 'rejected');
          showToast('Invitation declined.', 'info');
          await loadInvitations();
        } catch (e) {
          showToast(e.message || 'Failed to decline invitation', 'error');
          btn.disabled = false;
        }
      };
    });
  } catch (e) {
    console.error("Invitations error:", e);
    container.innerHTML = `
      <div class="card" style="padding: 2rem; text-align: center; color: var(--color-on-surface);">
        <p class="font-body-md" style="color: var(--color-error); margin-bottom: 1rem;">
          ${e.message || 'Unable to load invitations at this moment.'}
        </p>
        <button id="retry-invitations-btn" class="btn btn-outline" style="font-size: 13px;">
          <span class="material-symbols-outlined" style="font-size: 16px;">refresh</span>
          <span>Retry</span>
        </button>
      </div>
    `;
    const retryBtn = document.getElementById('retry-invitations-btn');
    if (retryBtn) retryBtn.onclick = loadInvitations;
  }
}

async function loadEngagements() {
  const container = document.getElementById('engagements-list');
  if (!container) return;

  if (!auth.isLoggedIn()) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 2.5rem; color: var(--color-outline);">
        <p class="font-body-md">Sign in as a creator to review your active production contracts and engagements.</p>
      </div>
    `;
    return;
  }

  try {
    const engs = await engagementApi.mine();
    if (!engs?.length) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem; color: var(--color-outline); border: 1px dashed var(--color-outline-variant);">
          <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.75rem; color: var(--color-primary);">work</span>
          <p class="font-body-md" style="margin: 0; color: var(--color-on-surface-variant);">No active engagements yet. Accepted pitch invitations appear here during production.</p>
        </div>`;
      return;
    }
    container.innerHTML = engs.map(eng => `
      <div class="card card-lift" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="badge ${eng.status === 'active' ? 'badge-primary' : 'badge-secondary'}">${eng.status.toUpperCase()}</span>
            <span class="font-label-tag" style="color: var(--color-outline);">Commercial Engagement</span>
          </div>
          <h3 class="font-headline-sm" style="color: var(--color-primary); margin: 0 0 0.25rem 0;">Active Production Contract</h3>
          <p class="font-body-sm" style="color: var(--color-outline); margin: 0;">Campaign ID: ${eng.campaign_id}</p>
        </div>
        <a href="#brief/${eng.campaign_id}" class="btn btn-outline" style="font-size: 13px;">
          <span>View Production Brief</span>
        </a>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<div style="color: var(--color-error); padding: 1rem;">${e.message}</div>`;
  }
}

// ─── Portfolio Works Management ──────────────────────────────────────────────
async function loadPortfolioWorks() {
  const container = document.getElementById('creator-portfolio-manager');
  if (!container) return;

  const user = auth.getUser();
  const creatorId = user?.id ? 'elena-vance' : 'elena-vance'; // match seeded or active profile
  const creator = store.getCreator(creatorId) || store.getCreators()[0];

  let items = [];
  try {
    if (auth.isLoggedIn()) {
      const apiItems = await portfolioApi.mine();
      if (apiItems && apiItems.length > 0) items = apiItems;
    }
  } catch (err) {
    console.warn("Could not load backend portfolio items, falling back to local dossier:", err);
  }

  if (items.length === 0 && creator?.portfolio) {
    items = creator.portfolio;
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--color-surface-container); padding-bottom: 1rem;">
      <div>
        <h2 class="font-headline-sm" style="color: var(--color-primary); margin: 0;">Portfolio Dossier & Works</h2>
        <p class="font-body-sm" style="margin: 0; color: var(--color-on-surface-variant);">
          Showcase generative commercial spots, neural simulations, and cinematic reels to commercial brands.
        </p>
      </div>
      <button id="add-portfolio-item-btn" class="btn btn-primary" style="font-size: 13px; padding: 0.55rem 1.25rem;">
        <span class="material-symbols-outlined" style="font-size: 18px;">add_photo_alternate</span>
        <span>Add Portfolio Work</span>
      </button>
    </div>

    <!-- Portfolio Grid -->
    <div id="portfolio-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
      ${items.length === 0 ? `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--color-outline); border: 1px dashed var(--color-outline-variant); border-radius: var(--radius-lg);">
          <span class="material-symbols-outlined" style="font-size: 48px; color: var(--color-primary); display: block; margin-bottom: 0.5rem;">photo_library</span>
          <h3 class="font-headline-sm" style="color: var(--color-on-surface); margin-bottom: 0.25rem;">No Portfolio Works Uploaded</h3>
          <p class="font-body-md" style="margin: 0 0 1rem 0;">Upload high-fidelity generative frames and video reels to showcase your prompt direction.</p>
          <button id="empty-add-portfolio-btn" class="btn btn-primary" style="font-size: 13px;">Upload First Work</button>
        </div>
      ` : items.map(item => {
        const thumb = item.thumbnail_url || item.image || item.media_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2e_S-Wjhx0Vohrcvzov4AzOu5Oi3bvVH9WF9YnnCfIoR5Lx-wMM4YRA8fORy2HGYTGTDo_BN45gqf0I_EysEnBaq9mbqUEJj37M4GjTubQG9uJ1iXkpni7FdfYXJpsSn-4bGNg3s0Z9wdVASW4aAlSsyN_Hqj4Q2DPmzDi0U4JZU_8YSfeW_SuWObOULichNmr6Q5g9JL7oHFJwRDVQ--fj96tv4HL7GQagqq-FX6-ZdTrdAXENecuA';
        const toolsList = Array.isArray(item.tools) ? item.tools : (typeof item.tools === 'string' ? item.tools.split(',') : []);

        return `
          <div class="card card-lift portfolio-card-item" data-id="${item.id}" style="display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--color-outline-variant);">
            <div style="aspect-ratio: 16/10; position: relative; background: #000; overflow: hidden;">
              <img src="${thumb}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" />
              <div style="position: absolute; top: 8px; left: 8px;">
                <span class="badge badge-secondary" style="font-size: 10px;">${item.badge || item.category || 'Commercial Spot'}</span>
              </div>
              ${item.duration ? `
                <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.75); color: #fff; font-size: 11px; padding: 2px 6px; border-radius: var(--radius-xs);">
                  ${item.duration}
                </div>
              ` : ''}
            </div>

            <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; flex: 1;">
              <div>
                <h3 class="font-title-editorial" style="color: var(--color-primary); margin: 0 0 0.25rem 0; font-size: 17px;">
                  ${item.title}
                </h3>
                <p class="font-body-sm" style="color: var(--color-on-surface-variant); margin: 0; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${item.subtitle || item.workflow || 'Generative visual production sequence.'}
                </p>
              </div>

              ${toolsList.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  ${toolsList.slice(0, 3).map(t => `<span class="badge badge-neutral" style="font-size: 10px;">${t.trim()}</span>`).join('')}
                </div>
              ` : ''}

              <div style="margin-top: auto; border-top: 1px solid var(--color-surface-container); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                <button class="btn btn-surface inspect-port-btn" data-id="${item.id}" style="padding: 0.35rem 0.75rem; font-size: 12px;">
                  <span class="material-symbols-outlined" style="font-size: 15px;">visibility</span>
                  <span>Inspect</span>
                </button>
                <button class="btn btn-outline delete-port-btn" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 12px; color: var(--color-error); border-color: rgba(186,26,26,0.3);">
                  <span class="material-symbols-outlined" style="font-size: 15px;">delete</span>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Open "Add Portfolio Work" modal
  const openAddModal = () => {
    let selectedFile = null;

    openModal({
      title: "Add New Portfolio Work",
      subtitle: "Upload production stills or video reel masters to your creator portfolio.",
      maxWidth: "680px",
      contentHtml: `
        <form id="add-port-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- File Drop / Preview Zone -->
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem; color: var(--color-on-surface);">
              Media Asset * (JPEG, PNG, WebP, MP4)
            </label>
            <div id="port-dropzone" style="border: 2px dashed var(--color-secondary-gold); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; background: var(--color-surface-container-low); cursor: pointer; transition: background 0.2s;">
              <input type="file" id="port-file-input" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4" style="display: none;" />
              <div id="port-preview-container" style="display: none; aspect-ratio: 16/9; max-height: 220px; margin: 0 auto 0.75rem auto; border-radius: var(--radius-sm); overflow: hidden; background: #000;">
                <img id="port-img-preview" src="" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div id="port-upload-prompt">
                <span class="material-symbols-outlined" style="font-size: 36px; color: var(--color-primary); display: block; margin-bottom: 0.25rem;">cloud_upload</span>
                <span class="font-label-md" style="color: var(--color-primary); display: block;">Click to choose an image or drag & drop</span>
                <span class="font-body-sm" style="color: var(--color-outline); font-size: 11.5px;">Max file size 15 MB</span>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div style="grid-column: span 2;">
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Project Title *</label>
              <input class="input" id="port-title-input" required placeholder="e.g. Lumina Pulse — Kinetic Architecture" />
            </div>

            <div>
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Category</label>
              <select class="select" id="port-category-select">
                <option selected>Commercial Spots</option>
                <option>Spec Work</option>
                <option>Short Films</option>
                <option>3D Motion & Neural Loops</option>
                <option>Concept Art</option>
              </select>
            </div>

            <div>
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Aspect Ratio</label>
              <select class="select" id="port-ar-select">
                <option selected>16:9 • 4K ProRes</option>
                <option>9:16 Vertical Reel</option>
                <option>2.39:1 Anamorphic</option>
                <option>1:1 Square</option>
              </select>
            </div>

            <div>
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Duration</label>
              <input class="input" id="port-duration-input" placeholder="e.g. 0:45 or Stills Master" value="0:45" />
            </div>

            <div>
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Client / License Badge</label>
              <select class="select" id="port-badge-select">
                <option selected>Client Project</option>
                <option>Commercial License Available</option>
                <option>Spec Narrative</option>
                <option>Festival Selection</option>
              </select>
            </div>

            <div style="grid-column: span 2;">
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">AI Tools & Pipeline (comma-separated)</label>
              <input class="input" id="port-tools-input" placeholder="Runway Gen-3, Midjourney v6, ComfyUI, Topaz Video AI" value="Runway Gen-3, Midjourney v6, ComfyUI" />
            </div>

            <div style="grid-column: span 2;">
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Project Description / Narrative Notes</label>
              <textarea class="textarea" id="port-desc-input" rows="2" placeholder="Briefly describe the concept, subject matter, and creative vision…"></textarea>
            </div>

            <div style="grid-column: span 2;">
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Step-by-Step Workflow Breakdown</label>
              <input class="input" id="port-workflow-input" placeholder="e.g. Midjourney style exploration → Runway Gen-3 motion pass → DaVinci color grade" />
            </div>
          </div>

          <div id="port-upload-error" style="display:none; color: var(--color-error); font-size: 13px;"></div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--color-surface-container); padding-top: 1rem;">
            <button type="button" class="btn btn-outline" onclick="window.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" id="port-submit-btn">
              <span class="material-symbols-outlined" style="font-size: 17px;">save</span>
              <span>Publish Work</span>
            </button>
          </div>
        </form>
      `
    });

    const dropzone = document.getElementById('port-dropzone');
    const fileInput = document.getElementById('port-file-input');
    const previewContainer = document.getElementById('port-preview-container');
    const imgPreview = document.getElementById('port-img-preview');
    const uploadPrompt = document.getElementById('port-upload-prompt');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          selectedFile = file;
          const reader = new FileReader();
          reader.onload = (re) => {
            if (imgPreview && previewContainer) {
              imgPreview.src = re.target.result;
              previewContainer.style.display = 'block';
              if (uploadPrompt) uploadPrompt.style.display = 'none';
            }
          };
          reader.readAsDataURL(file);
        }
      };
    }

    const form = document.getElementById('add-port-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('port-submit-btn');
        const errDiv = document.getElementById('port-upload-error');
        errDiv.style.display = 'none';

        const title = document.getElementById('port-title-input')?.value.trim();
        if (!title) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px; animation: spin 1s linear infinite;">autorenew</span> Publishing…`;

        const itemData = {
          title,
          subtitle: document.getElementById('port-desc-input')?.value.trim() || null,
          category: document.getElementById('port-category-select')?.value,
          aspect_ratio: document.getElementById('port-ar-select')?.value,
          duration: document.getElementById('port-duration-input')?.value.trim() || '0:45',
          badge: document.getElementById('port-badge-select')?.value,
          tools: (document.getElementById('port-tools-input')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
          workflow: document.getElementById('port-workflow-input')?.value.trim() || null,
          output: '4K ProRes'
        };

        try {
          let created = null;
          if (auth.isLoggedIn()) {
            created = await portfolioApi.create(itemData);
            if (selectedFile && created?.id) {
              submitBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px; animation: spin 1s linear infinite;">autorenew</span> Uploading Media…`;
              const mediaRes = await portfolioApi.uploadMedia(created.id, selectedFile);
              created.media_url = mediaRes.media_url || mediaRes.thumbnail_url;
              created.thumbnail_url = mediaRes.thumbnail_url || mediaRes.media_url;
            }
          }

          // Persist to store reactive cache
          const storeItem = {
            id: created?.id || `port-${Date.now()}`,
            title: itemData.title,
            subtitle: itemData.subtitle,
            category: itemData.category,
            aspectRatio: itemData.aspect_ratio,
            duration: itemData.duration,
            badge: itemData.badge,
            tools: itemData.tools,
            workflow: itemData.workflow,
            output: itemData.output,
            image: created?.thumbnail_url || (imgPreview?.src || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2e_S-Wjhx0Vohrcvzov4AzOu5Oi3bvVH9WF9YnnCfIoR5Lx-wMM4YRA8fORy2HGYTGTDo_BN45gqf0I_EysEnBaq9mbqUEJj37M4GjTubQG9uJ1iXkpni7FdfYXJpsSn-4bGNg3s0Z9wdVASW4aAlSsyN_Hqj4Q2DPmzDi0U4JZU_8YSfeW_SuWObOULichNmr6Q5g9JL7oHFJwRDVQ--fj96tv4HL7GQagqq-FX6-ZdTrdAXENecuA')
          };
          store.addPortfolioItem(creatorId, storeItem);

          closeModal();
          showToast('Portfolio work successfully published!', 'check_circle', 4000);
          await loadPortfolioWorks();
        } catch (err) {
          console.error("Failed to add portfolio work:", err);
          errDiv.textContent = err.message || 'Failed to save portfolio work.';
          errDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Publish Work';
        }
      };
    }
  };

  const addBtn = document.getElementById('add-portfolio-item-btn');
  if (addBtn) addBtn.onclick = openAddModal;
  const emptyAddBtn = document.getElementById('empty-add-portfolio-btn');
  if (emptyAddBtn) emptyAddBtn.onclick = openAddModal;

  // Inspect Portfolio Work Modal
  container.querySelectorAll('.inspect-port-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const work = items.find(i => i.id === id);
      if (!work) return;

      const img = work.thumbnail_url || work.image || work.media_url;
      const tools = Array.isArray(work.tools) ? work.tools.join(', ') : work.tools;

      openModal({
        title: work.title,
        subtitle: `${work.category || 'Commercial Work'} • ${work.aspect_ratio || work.aspectRatio || '16:9'}`,
        maxWidth: "680px",
        contentHtml: `
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="aspect-ratio: 16/9; border-radius: var(--radius-md); overflow: hidden; background: #000;">
              <img src="${img}" alt="${work.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div class="card" style="padding: 1.25rem; background: var(--color-surface-container-low);">
              <span class="font-label-tag" style="color: var(--color-primary); display: block; margin-bottom: 0.35rem;">Synopsis & Narrative</span>
              <p style="margin: 0; line-height: 1.5; color: var(--color-on-surface); font-size: 13.5px;">
                ${work.subtitle || work.workflow || 'Generative cinematic production sequence.'}
              </p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 13px;">
              <div class="card" style="padding: 0.75rem;">
                <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px;">Pipeline Models</span>
                <strong style="color: var(--color-primary); display: block;">${tools || 'Runway Gen-3'}</strong>
              </div>
              <div class="card" style="padding: 0.75rem;">
                <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px;">Master Format</span>
                <strong style="color: var(--color-secondary); display: block;">${work.output || '4K ProRes'}</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
              <button class="btn btn-outline" onclick="window.closeModal()">Close</button>
            </div>
          </div>
        `
      });
    };
  });

  // Delete Portfolio Work
  container.querySelectorAll('.delete-port-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (!confirm('Are you sure you want to remove this portfolio work from your studio dossier?')) return;

      try {
        btn.disabled = true;
        if (auth.isLoggedIn()) {
          try { await portfolioApi.delete(id); } catch {}
        }
        store.removePortfolioItem(creatorId, id);
        showToast('Portfolio item removed.', 'info');
        await loadPortfolioWorks();
      } catch (err) {
        showToast(err.message || 'Failed to remove work', 'error');
        btn.disabled = false;
      }
    };
  });
}

// ─── Creator Profile Editor with Avatar Upload ──────────────────────────────
async function loadCreatorProfileEditor() {
  const container = document.getElementById('creator-profile-editor');
  if (!container) return;

  try {
    let profile = null;
    if (auth.isLoggedIn()) {
      try { profile = await profileApi.getMyCreatorProfile(); } catch {}
    }

    const user = auth.getUser();
    const creatorId = user?.id ? 'elena-vance' : 'elena-vance';
    const storeCreator = store.getCreator(creatorId) || store.getCreators()[0];

    const currentAvatar = profile?.avatar_url || storeCreator?.avatar || null;
    const displayName = profile?.display_name || storeCreator?.name || user?.full_name || '';
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CR';

    container.innerHTML = `
      <h2 class="font-headline-sm" style="color: var(--color-primary); margin-bottom: 0.25rem;">
        ${profile ? 'Edit Creator Profile' : 'Studio Profile & Media Dossier'}
      </h2>
      <p class="font-body-sm" style="color: var(--color-on-surface-variant); margin-bottom: 2rem;">
        Manage your public persona, representation emblem, specialized tools, and commercial day rates.
      </p>

      <!-- Avatar Upload Section -->
      <div class="card" style="padding: 1.5rem; background: var(--color-surface-container-low); margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; border: 1.5px solid var(--color-secondary-gold);">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <div id="creator-avatar-preview-box" style="width: 88px; height: 88px; border-radius: 50%; overflow: hidden; background: var(--color-primary); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); border: 2px solid var(--color-secondary-gold); position: relative; flex-shrink: 0;">
            ${currentAvatar ? `
              <img id="creator-avatar-img" src="${currentAvatar}" alt="${displayName}" style="width: 100%; height: 100%; object-fit: cover;" />
            ` : `
              <span id="creator-avatar-initials" style="font-size: 32px; font-weight: 700; color: #fff; letter-spacing: 0.05em;">${initials}</span>
            `}
          </div>
          <div>
            <span class="font-label-tag" style="color: var(--color-secondary); display: block; margin-bottom: 0.25rem;">Representation Picture</span>
            <strong style="color: var(--color-on-surface); font-size: 16px; display: block;">${displayName || 'Creator'}</strong>
            <span class="font-body-sm" style="color: var(--color-outline); font-size: 12px; display: block; margin-top: 2px;">
              Accepted formats: JPG, PNG, WebP (Max 10 MB)
            </span>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <input type="file" id="creator-avatar-file-input" accept="image/jpeg,image/png,image/webp,image/gif" style="display: none;" />
          <button type="button" id="trigger-avatar-upload-btn" class="btn btn-primary" style="font-size: 13px; padding: 0.55rem 1.25rem;">
            <span class="material-symbols-outlined" style="font-size: 17px;">upload</span>
            <span>${currentAvatar ? 'Replace Picture' : 'Upload Avatar'}</span>
          </button>
          ${currentAvatar ? `
            <button type="button" id="remove-avatar-btn" class="btn btn-outline" style="font-size: 13px; padding: 0.55rem 1rem; color: var(--color-error); border-color: rgba(186,26,26,0.3);">
              <span class="material-symbols-outlined" style="font-size: 17px;">delete</span>
              <span>Remove</span>
            </button>
          ` : ''}
        </div>
      </div>
      <div id="avatar-upload-status" style="display: none; font-size: 12.5px; color: var(--color-primary); font-weight: 600; margin-bottom: 1.5rem; align-items: center; gap: 6px;">
        <span class="material-symbols-outlined" style="font-size: 18px; animation: spin 1s linear infinite;">autorenew</span>
        <span>Uploading to Atelier Storage…</span>
      </div>

      <!-- Main Profile Form -->
      <form id="creator-profile-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Display Name *</label>
            <input class="input" id="cp-name" required value="${profile?.display_name || storeCreator?.name || ''}" placeholder="Your name" />
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Handle *</label>
            <input class="input" id="cp-handle" required value="${profile?.handle || storeCreator?.handle || ''}" placeholder="@yourhandle" />
          </div>
          <div style="grid-column: span 2;">
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Title *</label>
            <input class="input" id="cp-title" required value="${profile?.title || storeCreator?.title || ''}" placeholder="e.g. AI Cinematographer & Director" />
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Discipline *</label>
            <select class="select" id="cp-discipline">
              ${['AI Filmmaker','3D & Neural Animator','Concept Artist','Visual Effects','Motion Designer','Sound Designer'].map(d =>
                `<option ${(profile?.discipline || storeCreator?.discipline) === d ? 'selected' : ''}>${d}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Location</label>
            <input class="input" id="cp-location" value="${profile?.location || storeCreator?.location || ''}" placeholder="City, Country" />
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Availability</label>
            <select class="select" id="cp-availability">
              ${['Available Now','Available in 2 Weeks','Booking Next Month'].map(a =>
                `<option ${(profile?.availability || storeCreator?.availability) === a ? 'selected' : ''}>${a}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Starting Rate (USD)</label>
            <input class="input" type="number" id="cp-rate" value="${profile?.starting_rate || storeCreator?.startingRate || 4500}" placeholder="e.g. 4500" min="0" />
          </div>
          <div style="grid-column: span 2;">
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Bio & Specialization</label>
            <textarea class="textarea" id="cp-bio" rows="3" style="resize: vertical;" placeholder="Describe your cinematic style and neural model specializations…">${profile?.bio || storeCreator?.bio || ''}</textarea>
          </div>
          <div style="grid-column: span 2;">
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Tools (comma-separated)</label>
            <input class="input" id="cp-tools" value="${(profile?.tools || storeCreator?.tools || []).join(', ')}" placeholder="Runway Gen-3, Midjourney v6, ComfyUI" />
          </div>
          <div style="grid-column: span 2;">
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Skills (comma-separated)</label>
            <input class="input" id="cp-skills" value="${(profile?.skills || storeCreator?.skills || []).join(', ')}" placeholder="Cinematic 35mm, Color Grading, Automotive" />
          </div>
        </div>

        <div id="cp-error" style="display:none; color: var(--color-error); font-size: 13px; margin-top: 0.25rem;"></div>

        <button type="submit" class="btn btn-primary" id="cp-submit-btn" style="align-self: flex-start; padding: 0.75rem 2rem; font-size: 14px; margin-top: 0.5rem;">
          ${profile ? 'Save Profile Changes' : 'Save Profile'}
        </button>
      </form>
    `;

    // Avatar upload wiring
    const fileInput = document.getElementById('creator-avatar-file-input');
    const triggerUploadBtn = document.getElementById('trigger-avatar-upload-btn');
    const removeAvatarBtn = document.getElementById('remove-avatar-btn');
    const avatarStatus = document.getElementById('avatar-upload-status');
    const previewBox = document.getElementById('creator-avatar-preview-box');

    if (triggerUploadBtn && fileInput) {
      triggerUploadBtn.onclick = () => fileInput.click();

      fileInput.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Display immediate local preview
        const reader = new FileReader();
        reader.onload = (re) => {
          if (previewBox) {
            previewBox.innerHTML = `<img src="${re.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />`;
          }
        };
        reader.readAsDataURL(file);

        if (avatarStatus) avatarStatus.style.display = 'flex';
        triggerUploadBtn.disabled = true;

        try {
          let newUrl = null;
          if (auth.isLoggedIn()) {
            const res = await profileApi.uploadAvatar(file);
            newUrl = res.avatar_url;
          } else {
            // Local fallback preview for guest / simulated testing
            newUrl = await new Promise(res => {
              const r = new FileReader();
              r.onload = () => res(r.target.result);
              r.readAsDataURL(file);
            });
          }

          store.updateCreator(creatorId, { avatar: newUrl, avatar_url: newUrl });
          showToast('Profile picture uploaded and updated across Atelier!', 'check_circle', 4000);
          await loadCreatorProfileEditor();
        } catch (err) {
          console.error("Avatar upload failed:", err);
          showToast(err.message || 'Avatar upload failed. Ensure file is an image under 10 MB.', 'error');
          await loadCreatorProfileEditor();
        } finally {
          triggerUploadBtn.disabled = false;
          if (avatarStatus) avatarStatus.style.display = 'none';
        }
      };
    }

    if (removeAvatarBtn) {
      removeAvatarBtn.onclick = async () => {
        try {
          removeAvatarBtn.disabled = true;
          if (auth.isLoggedIn()) {
            await profileApi.deleteAvatar();
          }
          store.updateCreator(creatorId, { avatar: null, avatar_url: null });
          showToast('Profile picture removed.', 'info');
          await loadCreatorProfileEditor();
        } catch (err) {
          showToast(err.message || 'Failed to remove picture', 'error');
          removeAvatarBtn.disabled = false;
        }
      };
    }

    // Main form submit
    const form = document.getElementById('creator-profile-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const errDiv = document.getElementById('cp-error');
        const submitBtn = document.getElementById('cp-submit-btn');
        errDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving…';

        const splitCsv = (v) => v.split(',').map(s => s.trim()).filter(Boolean);
        const data = {
          display_name: document.getElementById('cp-name')?.value.trim(),
          handle: document.getElementById('cp-handle')?.value.trim().replace(/^@/, ''),
          title: document.getElementById('cp-title')?.value.trim(),
          discipline: document.getElementById('cp-discipline')?.value,
          location: document.getElementById('cp-location')?.value.trim() || null,
          availability: document.getElementById('cp-availability')?.value,
          starting_rate: parseInt(document.getElementById('cp-rate')?.value) || 4500,
          bio: document.getElementById('cp-bio')?.value.trim() || null,
          tools: splitCsv(document.getElementById('cp-tools')?.value || ''),
          skills: splitCsv(document.getElementById('cp-skills')?.value || ''),
          styles: storeCreator?.styles || [],
          formats: storeCreator?.formats || [],
        };

        try {
          if (auth.isLoggedIn()) {
            if (profile) {
              await profileApi.updateCreatorProfile(data);
            } else {
              await profileApi.createCreatorProfile(data);
            }
          }
          store.updateCreator(creatorId, {
            name: data.display_name,
            handle: `@${data.handle}`,
            title: data.title,
            discipline: data.discipline,
            location: data.location,
            availability: data.availability,
            startingRate: data.starting_rate,
            bio: data.bio,
            tools: data.tools,
            skills: data.skills
          });

          showToast('Profile saved and updated across Atelier!', 'check_circle');
          await loadCreatorProfileEditor();
        } catch (err) {
          errDiv.textContent = err.message || 'Failed to save profile.';
          errDiv.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Save Profile Changes';
        }
      };
    }
  } catch (e) {
    container.innerHTML = `<div style="color: var(--color-error); padding: 1rem;">${e.message}</div>`;
  }
}
