// Creator Dashboard — active engagements, invitations, and profile quick-edit
import { auth } from '../api.js';
import { invitationApi, engagementApi, profileApi } from '../api.js';
import { showToast } from '../components/Toast.js';

export function renderCreatorDashboardView() {
  const user = auth.getUser();
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
          <a href="#explore" class="btn btn-outline" style="padding: 0.65rem 1.25rem;">
            <span class="material-symbols-outlined" style="font-size: 18px;">explore</span>
            <span>Browse Opportunities</span>
          </a>
        </div>
      </section>

      <!-- Tabs -->
      <section class="container-max" style="margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 0; border-bottom: 2px solid var(--color-surface-container);">
          ${['Invitations', 'Engagements', 'My Profile'].map((tab, i) => `
            <button class="creator-dash-tab ${i === 0 ? 'active' : ''}" data-tab="${i}"
              style="padding: 0.65rem 1.25rem; background: none; border: none; border-bottom: 2px solid ${i === 0 ? 'var(--color-primary)' : 'transparent'}; margin-bottom: -2px; cursor: pointer; font-size: 14px; font-weight: ${i === 0 ? '700' : '500'}; color: ${i === 0 ? 'var(--color-primary)' : 'var(--color-outline)'}; transition: all 0.2s;">
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
              <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.5rem;">hourglass_empty</span>
              Loading invitations…
            </div>
          </div>
        </div>

        <!-- Engagements Panel -->
        <div id="creator-panel-1" style="display: none;">
          <div id="engagements-list" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; padding: 3rem; color: var(--color-outline);">
              <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.5rem;">hourglass_empty</span>
              Loading engagements…
            </div>
          </div>
        </div>

        <!-- Profile Panel -->
        <div id="creator-panel-2" style="display: none;">
          <div id="creator-profile-editor" class="card" style="padding: 2rem; max-width: 700px;">
            <div style="text-align: center; padding: 2rem; color: var(--color-outline);">
              <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.5rem;">hourglass_empty</span>
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
        document.getElementById(`creator-panel-${i}`).style.display = 'none';
      });
      const idx = parseInt(btn.dataset.tab);
      btn.style.borderBottomColor = 'var(--color-primary)';
      btn.style.color = 'var(--color-primary)';
      btn.style.fontWeight = '700';
      document.getElementById(`creator-panel-${idx}`).style.display = 'block';
    });
  });

  await loadInvitations();
  await loadEngagements();
  await loadCreatorProfileEditor();
}

async function loadInvitations() {
  const container = document.getElementById('invitations-list');
  try {
    const invitations = await invitationApi.mine();
    if (!invitations?.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--color-outline);">
          <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.75rem;">mail</span>
          <p class="font-body-md">No invitations yet. Brands will invite you when they find a great match.</p>
        </div>`;
      return;
    }
    container.innerHTML = invitations.map(inv => `
      <div class="card" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span class="badge ${inv.status === 'pending' ? 'badge-primary' : inv.status === 'accepted' ? 'badge-primary' : 'badge-secondary'}" style="font-size: 10px;">${inv.status}</span>
          </div>
          <p class="font-label-lg" style="font-weight: 600; margin-bottom: 0.25rem;">Campaign Invitation</p>
          ${inv.message ? `<p class="font-body-sm" style="color: var(--color-outline); max-width: 500px;">${inv.message}</p>` : ''}
        </div>
        ${inv.status === 'pending' ? `
        <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
          <button class="btn btn-outline inv-reject-btn" data-id="${inv.id}" style="padding: 0.4rem 0.9rem; font-size: 13px;">Decline</button>
          <button class="btn btn-primary inv-accept-btn" data-id="${inv.id}" style="padding: 0.4rem 0.9rem; font-size: 13px;">Accept</button>
        </div>` : ''}
      </div>
    `).join('');

    container.querySelectorAll('.inv-accept-btn').forEach(btn => {
      btn.onclick = async () => {
        try {
          btn.disabled = true; btn.textContent = 'Accepting…';
          await invitationApi.respond(btn.dataset.id, 'accepted');
          showToast('Invitation accepted! Engagement is now active.', 'check_circle');
          await loadInvitations();
          await loadEngagements();
        } catch (e) {
          showToast(e.message, 'error');
          btn.disabled = false; btn.textContent = 'Accept';
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
        } catch (e) { showToast(e.message, 'error'); btn.disabled = false; }
      };
    });
  } catch (e) {
    container.innerHTML = `<div style="color: var(--color-error); padding: 1rem;">${e.message}</div>`;
  }
}

async function loadEngagements() {
  const container = document.getElementById('engagements-list');
  try {
    const engs = await engagementApi.mine();
    if (!engs?.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--color-outline);">
          <span class="material-symbols-outlined" style="font-size: 40px; display: block; margin-bottom: 0.75rem;">work</span>
          <p class="font-body-md">No active engagements yet.</p>
        </div>`;
      return;
    }
    container.innerHTML = engs.map(eng => `
      <div class="card" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p class="font-label-lg" style="font-weight: 600; margin-bottom: 0.25rem;">Active Engagement</p>
            <p class="font-body-sm" style="color: var(--color-outline);">Campaign ID: ${eng.campaign_id}</p>
          </div>
          <span class="badge ${eng.status === 'active' ? 'badge-primary' : 'badge-secondary'}">${eng.status}</span>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = `<div style="color: var(--color-error); padding: 1rem;">${e.message}</div>`;
  }
}

async function loadCreatorProfileEditor() {
  const container = document.getElementById('creator-profile-editor');
  try {
    let profile = null;
    try { profile = await profileApi.getMyCreatorProfile(); } catch {}

    container.innerHTML = `
      <h2 class="font-headline-sm" style="color: var(--color-primary); margin-bottom: 1.5rem;">
        ${profile ? 'Edit Profile' : 'Complete Your Profile'}
      </h2>
      <form id="creator-profile-form" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Display Name *</label>
            <input class="input" id="cp-name" required value="${profile?.display_name || ''}" placeholder="Your name" />
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Handle *</label>
            <input class="input" id="cp-handle" required value="${profile?.handle || ''}" placeholder="@yourhandle" />
          </div>
          <div style="grid-column: span 2;">
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Title *</label>
            <input class="input" id="cp-title" required value="${profile?.title || ''}" placeholder="e.g. AI Filmmaker & Director" />
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Discipline *</label>
            <select class="select" id="cp-discipline">
              ${['AI Filmmaker','3D & Neural Animator','Concept Artist','Visual Effects','Motion Designer','Sound Designer'].map(d =>
                `<option ${profile?.discipline === d ? 'selected' : ''}>${d}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Location</label>
            <input class="input" id="cp-location" value="${profile?.location || ''}" placeholder="City, Country" />
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Availability</label>
            <select class="select" id="cp-availability">
              ${['Available Now','Available in 2 Weeks','Booking Next Month'].map(a =>
                `<option ${profile?.availability === a ? 'selected' : ''}>${a}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Starting Rate (USD)</label>
            <input class="input" type="number" id="cp-rate" value="${profile?.starting_rate || ''}" placeholder="e.g. 3500" min="0" />
          </div>
          <div style="grid-column: span 2;">
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Bio</label>
            <textarea class="input" id="cp-bio" rows="3" style="resize: vertical;" placeholder="Describe your style and specialization…">${profile?.bio || ''}</textarea>
          </div>
          <div style="grid-column: span 2;">
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Tools (comma-separated)</label>
            <input class="input" id="cp-tools" value="${(profile?.tools || []).join(', ')}" placeholder="Runway Gen-3, Midjourney v6, ComfyUI" />
          </div>
          <div style="grid-column: span 2;">
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Skills (comma-separated)</label>
            <input class="input" id="cp-skills" value="${(profile?.skills || []).join(', ')}" placeholder="Cinematic 35mm, Color Grading, Automotive" />
          </div>
        </div>
        <div id="cp-error" style="display:none; color: var(--color-error); font-size: 13px; margin-top: 0.25rem;"></div>
        <button type="submit" class="btn btn-primary" id="cp-submit-btn" style="align-self: flex-start; padding: 0.65rem 1.75rem;">
          ${profile ? 'Save Changes' : 'Create Profile'}
        </button>
      </form>
    `;

    const form = document.getElementById('creator-profile-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const errDiv = document.getElementById('cp-error');
      const submitBtn = document.getElementById('cp-submit-btn');
      errDiv.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';

      const splitCsv = (v) => v.split(',').map(s => s.trim()).filter(Boolean);
      const data = {
        display_name: document.getElementById('cp-name').value.trim(),
        handle: document.getElementById('cp-handle').value.trim().replace(/^@/, ''),
        title: document.getElementById('cp-title').value.trim(),
        discipline: document.getElementById('cp-discipline').value,
        location: document.getElementById('cp-location').value.trim() || null,
        availability: document.getElementById('cp-availability').value,
        starting_rate: parseInt(document.getElementById('cp-rate').value) || null,
        bio: document.getElementById('cp-bio').value.trim() || null,
        tools: splitCsv(document.getElementById('cp-tools').value),
        skills: splitCsv(document.getElementById('cp-skills').value),
        styles: [],
        formats: [],
      };

      try {
        if (profile) {
          await profileApi.updateCreatorProfile(data);
        } else {
          await profileApi.createCreatorProfile(data);
        }
        showToast('Profile saved!', 'check_circle');
        await loadCreatorProfileEditor();
      } catch (err) {
        errDiv.textContent = err.message;
        errDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = profile ? 'Save Changes' : 'Create Profile';
      }
    };
  } catch (e) {
    container.innerHTML = `<div style="color: var(--color-error); padding: 1rem;">${e.message}</div>`;
  }
}
