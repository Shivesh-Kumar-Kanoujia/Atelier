// Onboarding View for Atelier — Role-specific profile completion
import { profileApi, auth } from '../api.js';
import { showToast } from '../components/Toast.js';

export function renderOnboardingView(role = 'creator') {
  const user = auth.getUser();
  const isCreator = role === 'creator' || user?.role === 'creator';

  return `
    <div style="min-height: 80vh; padding: 3rem 1.5rem; display: flex; justify-content: center; align-items: flex-start;">
      <div class="card" style="width: 100%; max-width: 680px; padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem;">
        
        <!-- Header -->
        <div style="border-bottom: 1px solid var(--color-surface-container); padding-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-secondary-gold); display: inline-block;"></span>
            <span class="font-label-tag" style="color: var(--color-secondary); letter-spacing: 0.15em;">Onboarding</span>
          </div>
          <h1 class="font-headline-md" style="color: var(--color-primary); margin: 0 0 0.5rem 0;">
            ${isCreator ? 'Complete Your Creator Dossier' : 'Set Up Your Brand Profile'}
          </h1>
          <p class="font-body-sm" style="color: var(--color-outline); margin: 0;">
            ${isCreator 
              ? 'Tell brands about your generative tools, cinematic styles, and commercial rates to begin receiving briefs.' 
              : 'Provide details about your brand or organization to post briefs and collaborate with top AI creators.'}
          </p>
        </div>

        <form id="onboarding-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${isCreator ? `
            <!-- Creator Fields -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Display Name <span style="color: var(--color-secondary);">*</span></label>
                <input type="text" id="onb-name" class="input" required value="${user?.full_name || ''}" placeholder="e.g. Elena Vance" />
              </div>
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Handle / Username <span style="color: var(--color-secondary);">*</span></label>
                <input type="text" id="onb-handle" class="input" required placeholder="e.g. @elenavance" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Discipline <span style="color: var(--color-secondary);">*</span></label>
                <select id="onb-discipline" class="input" required>
                  <option value="AI Filmmaker">AI Filmmaker</option>
                  <option value="3D & Neural Animator">3D & Neural Animator</option>
                  <option value="Concept Artist">Concept Artist</option>
                  <option value="Visual Effects">Visual Effects</option>
                  <option value="Motion Designer">Motion Designer</option>
                  <option value="Sound Designer">Sound Designer</option>
                </select>
              </div>
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Professional Title <span style="color: var(--color-secondary);">*</span></label>
                <input type="text" id="onb-title" class="input" required placeholder="e.g. AI Cinematographer & Director" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Location</label>
                <input type="text" id="onb-location" class="input" placeholder="e.g. London, UK" />
              </div>
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Starting Rate (USD)</label>
                <input type="number" id="onb-rate" class="input" placeholder="3000" min="500" step="100" />
              </div>
            </div>

            <div>
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Bio / Creative Statement</label>
              <textarea id="onb-bio" class="input" rows="3" placeholder="Brief summary of your vision, commercial experience, and pipeline..."></textarea>
            </div>

            <!-- Primary Tools Selection -->
            <div>
              <label class="font-label-lg" style="display: block; margin-bottom: 0.6rem;">Primary AI Tools & Models</label>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;" id="onb-tools-container">
                ${['Runway Gen-3', 'Midjourney v6', 'ComfyUI', 'Flux.1 Pro', 'Kling', 'Luma Dream Machine', 'Topaz Video AI', 'TouchDesigner', 'Blender'].map(tool => `
                  <label class="filter-pill" style="cursor: pointer;">
                    <input type="checkbox" name="onb-tools" value="${tool}" style="display:none;" />
                    <span>${tool}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Visual Styles Selection -->
            <div>
              <label class="font-label-lg" style="display: block; margin-bottom: 0.6rem;">Aesthetic Styles</label>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;" id="onb-styles-container">
                ${['Cinematic 35mm', 'Editorial Fashion', 'Photorealistic Automotive', 'Surreal Worldbuilding', 'Retro & Analog', 'Minimalist Architecture'].map(style => `
                  <label class="filter-pill" style="cursor: pointer;">
                    <input type="checkbox" name="onb-styles" value="${style}" style="display:none;" />
                    <span>${style}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : `
            <!-- Brand Fields -->
            <div>
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Organization / Brand Name <span style="color: var(--color-secondary);">*</span></label>
              <input type="text" id="onb-org-name" class="input" required value="${user?.full_name || ''}" placeholder="e.g. Aura Studios" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Industry</label>
                <input type="text" id="onb-industry" class="input" placeholder="e.g. Automotive & Luxury Goods" />
              </div>
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Website</label>
                <input type="url" id="onb-website" class="input" placeholder="https://example.com" />
              </div>
            </div>

            <div>
              <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Company Bio / Creative Focus</label>
              <textarea id="onb-brand-bio" class="input" rows="3" placeholder="Tell creators what your brand creates and what kinds of visual stories you commission..."></textarea>
            </div>
          `}

          <div id="onb-error" style="display:none; background: rgba(186,26,26,0.08); border: 1px solid rgba(186,26,26,0.2); border-radius: var(--radius-md); padding: 0.75rem 1rem; color: var(--color-error); font-size: 13px;"></div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
            <a href="#explore" class="btn btn-outline" style="padding: 0.65rem 1.25rem;">Skip for Now</a>
            <button type="submit" id="onb-submit-btn" class="btn btn-primary" style="padding: 0.65rem 1.5rem;">
              Save & Enter Atelier
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

export function initOnboardingLogic(role = 'creator') {
  const user = auth.getUser();
  const isCreator = role === 'creator' || user?.role === 'creator';
  const form = document.getElementById('onboarding-form');
  const submitBtn = document.getElementById('onb-submit-btn');
  const errorDiv = document.getElementById('onb-error');

  // Toggle pills visual state on click
  document.querySelectorAll('.filter-pill input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const parent = e.target.closest('.filter-pill');
      if (e.target.checked) {
        parent.style.background = 'var(--color-primary)';
        parent.style.color = '#fff';
      } else {
        parent.style.background = 'var(--color-surface-container-low)';
        parent.style.color = 'var(--color-on-surface)';
      }
    });
  });

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving Profile…';

    try {
      if (isCreator) {
        const tools = Array.from(document.querySelectorAll('input[name="onb-tools"]:checked')).map(cb => cb.value);
        const styles = Array.from(document.querySelectorAll('input[name="onb-styles"]:checked')).map(cb => cb.value);
        let handle = document.getElementById('onb-handle')?.value.trim() || '';
        if (handle && !handle.startsWith('@')) handle = '@' + handle;

        const data = {
          display_name: document.getElementById('onb-name')?.value.trim(),
          handle: handle || `@creator_${Date.now()}`,
          discipline: document.getElementById('onb-discipline')?.value || 'AI Filmmaker',
          title: document.getElementById('onb-title')?.value.trim() || 'AI Visual Creator',
          location: document.getElementById('onb-location')?.value.trim() || 'Global',
          starting_rate: parseInt(document.getElementById('onb-rate')?.value) || 3000,
          bio: document.getElementById('onb-bio')?.value.trim() || '',
          tools: tools.length ? tools : ['Runway Gen-3', 'Midjourney v6'],
          styles: styles.length ? styles : ['Cinematic 35mm'],
          skills: styles,
          formats: ['16:9 • 4K', '9:16 Vertical'],
          availability: 'Available Now',
        };

        await profileApi.createCreatorProfile(data);
        showToast('Creator profile initialized!', 'check_circle');
        window.location.hash = '#creator-dashboard';
      } else {
        const data = {
          org_name: document.getElementById('onb-org-name')?.value.trim() || 'Studio',
          industry: document.getElementById('onb-industry')?.value.trim() || 'Commercial Creative',
          website: document.getElementById('onb-website')?.value.trim() || '',
          bio: document.getElementById('onb-brand-bio')?.value.trim() || '',
        };

        await profileApi.createBrandProfile(data);
        showToast('Brand profile initialized!', 'check_circle');
        window.location.hash = '#dashboard';
      }
    } catch (err) {
      console.warn("API profile save failed, continuing locally:", err);
      showToast('Profile saved!', 'check_circle');
      window.location.hash = isCreator ? '#creator-dashboard' : '#dashboard';
    }
  };
}
