// Auth View — Login & Register for Atelier
import { authApi, auth } from '../api.js';
import { showToast } from '../components/Toast.js';

export function renderAuthView(mode = 'login') {
  const isLogin = mode === 'login';
  return `
    <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
      <div class="card" style="width: 100%; max-width: 440px; padding: 2.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
        
        <div style="text-align: center;">
          <a href="#explore" class="brand-logo" style="justify-content: center; margin-bottom: 0.5rem; display: flex;">
            <span>ATELIER</span>
          </a>
          <p class="font-body-sm" style="color: var(--color-secondary); font-weight: 600; margin-bottom: 0.75rem;">
            Where AI Creativity Meets Brands.
          </p>
          <h1 class="font-headline-sm" style="color: var(--color-primary); margin-bottom: 0.25rem;">
            ${isLogin ? 'Welcome back' : 'Join Atelier'}
          </h1>
          <p class="font-body-sm" style="color: var(--color-outline);">
            ${isLogin ? 'Sign in to access your studio pipeline' : 'Create your account to get started'}
          </p>
        </div>

        <!-- Mode Toggle -->
        <div style="display: flex; background: var(--color-surface-container); border-radius: var(--radius-md); padding: 3px; gap: 3px;">
          <a href="#login" style="flex: 1; text-align: center; padding: 0.5rem; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
            ${isLogin ? 'background: var(--color-surface-container-lowest); color: var(--color-primary); box-shadow: var(--shadow-sm);' : 'color: var(--color-outline);'}">
            Login
          </a>
          <a href="#register" style="flex: 1; text-align: center; padding: 0.5rem; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
            ${!isLogin ? 'background: var(--color-surface-container-lowest); color: var(--color-primary); box-shadow: var(--shadow-sm);' : 'color: var(--color-outline);'}">
            Register
          </a>
        </div>

        <form id="auth-form" style="display: flex; flex-direction: column; gap: 1rem;">
          ${!isLogin ? `
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Full Name <span style="color: var(--color-secondary);">*</span></label>
            <input type="text" id="auth-name" class="input" required placeholder="Your full name" autocomplete="name" />
          </div>
          ` : ''}
          
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Email <span style="color: var(--color-secondary);">*</span></label>
            <input type="email" id="auth-email" class="input" required placeholder="you@example.com" autocomplete="email" />
          </div>

          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem;">Password <span style="color: var(--color-secondary);">*</span></label>
            <input type="password" id="auth-password" class="input" required placeholder="Min. 8 characters" autocomplete="${isLogin ? 'current-password' : 'new-password'}" minlength="8" />
          </div>

          ${!isLogin ? `
          <div>
            <label class="font-label-lg" style="display: block; margin-bottom: 0.6rem;">I am a… <span style="color: var(--color-secondary);">*</span></label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <label id="role-creator-label" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                <input type="radio" name="role" value="creator" id="role-creator" style="display:none;" />
                <span class="material-symbols-outlined" style="font-size: 28px; color: var(--color-primary);">palette</span>
                <span class="font-label-lg" style="font-weight: 600;">Creator</span>
                <span class="font-body-sm" style="color: var(--color-outline); font-size: 11px; text-align: center;">AI filmmaker, artist, or animator</span>
              </label>
              <label id="role-brand-label" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 2px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                <input type="radio" name="role" value="brand" id="role-brand" style="display:none;" />
                <span class="material-symbols-outlined" style="font-size: 28px; color: var(--color-secondary);">business</span>
                <span class="font-label-lg" style="font-weight: 600;">Brand / Org</span>
                <span class="font-body-sm" style="color: var(--color-outline); font-size: 11px; text-align: center;">Brand or organization seeking talent</span>
              </label>
            </div>
          </div>
          ` : ''}

          <div id="auth-error" style="display:none; background: rgba(186,26,26,0.08); border: 1px solid rgba(186,26,26,0.2); border-radius: var(--radius-md); padding: 0.75rem 1rem; color: var(--color-error); font-size: 13px;"></div>

          <button type="submit" class="btn btn-primary" id="auth-submit-btn" style="width: 100%; padding: 0.75rem; font-size: 15px; margin-top: 0.25rem;">
            ${isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p class="font-body-sm" style="text-align: center; color: var(--color-outline);">
          ${isLogin ? 'New to Atelier?' : 'Already have an account?'}
          <a href="${isLogin ? '#register' : '#login'}" style="color: var(--color-primary); font-weight: 600; margin-left: 4px;">
            ${isLogin ? 'Create an account' : 'Sign in'}
          </a>
        </p>
      </div>
    </div>
  `;
}

export function initAuthLogic(mode = 'login') {
  const isLogin = mode === 'login';
  const form = document.getElementById('auth-form');
  const submitBtn = document.getElementById('auth-submit-btn');
  const errorDiv = document.getElementById('auth-error');

  // Role selection highlight
  if (!isLogin) {
    const creatorLabel = document.getElementById('role-creator-label');
    const brandLabel = document.getElementById('role-brand-label');
    const creatorRadio = document.getElementById('role-creator');
    const brandRadio = document.getElementById('role-brand');

    function updateRoleStyles(selected) {
      const primary = 'border-color: var(--color-primary); background: rgba(10,53,37,0.04);';
      const secondary = 'border-color: var(--color-secondary); background: rgba(125,87,36,0.04);';
      const neutral = 'border-color: var(--color-outline-variant); background: transparent;';
      creatorLabel.style.cssText = creatorLabel.style.cssText.split(';').filter(s => !s.includes('border-color') && !s.includes('background')).join(';') +
        (selected === 'creator' ? primary : neutral);
      brandLabel.style.cssText = brandLabel.style.cssText.split(';').filter(s => !s.includes('border-color') && !s.includes('background')).join(';') +
        (selected === 'brand' ? secondary : neutral);
    }

    [creatorRadio, brandRadio].forEach(r => {
      r.addEventListener('change', () => updateRoleStyles(r.value));
    });

    // Default select creator
    creatorRadio.checked = true;
    updateRoleStyles('creator');
  }

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';

    const email = document.getElementById('auth-email')?.value.trim();
    const password = document.getElementById('auth-password')?.value;

    submitBtn.disabled = true;
    submitBtn.textContent = isLogin ? 'Signing in…' : 'Creating account…';

    try {
      if (isLogin) {
        await authApi.login(email, password);
        showToast('Welcome back!', 'check_circle');
      } else {
        const full_name = document.getElementById('auth-name')?.value.trim();
        const role = document.querySelector('input[name="role"]:checked')?.value;
        if (!full_name) throw new Error('Please enter your full name');
        if (!role) throw new Error('Please select your role (Creator or Brand)');
        await authApi.register(email, password, full_name, role);
        showToast('Account created! Complete your profile.', 'check_circle');
      }

      const user = auth.getUser();
      // Route to appropriate onboarding
      if (user?.role === 'creator') {
        window.location.hash = '#onboarding-creator';
      } else if (user?.role === 'brand') {
        window.location.hash = '#onboarding-brand';
      } else {
        window.location.hash = '#explore';
      }
    } catch (err) {
      errorDiv.textContent = err.message || 'Something went wrong. Please try again.';
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = isLogin ? 'Sign In' : 'Create Account';
    }
  };
}
