// Universal Modal Component for Atelier
export function openModal({ title, subtitle, contentHtml, maxWidth = '640px' }) {
  closeModal();

  const backdrop = document.createElement('div');
  backdrop.id = 'active-modal-backdrop';
  backdrop.className = 'modal-backdrop open';

  backdrop.innerHTML = `
    <div class="modal-card" style="max-width: ${maxWidth}; padding: 2rem;">
      <button id="modal-close-x" style="position: absolute; top: 1.25rem; right: 1.25rem; background: none; border: none; cursor: pointer; color: var(--color-outline); padding: 4px; display: flex; z-index: 10;" aria-label="Close">
        <span class="material-symbols-outlined">close</span>
      </button>
      ${title ? `<h3 class="font-headline-sm" style="color: var(--color-primary); margin-bottom: 0.25rem; padding-right: 2rem;">${title}</h3>` : ''}
      ${subtitle ? `<p class="font-body-sm" style="color: var(--color-on-surface-variant); margin-bottom: 1.5rem;">${subtitle}</p>` : ''}
      <div class="modal-body-content">
        ${contentHtml}
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.style.overflow = 'hidden';

  const closeBtn = backdrop.querySelector('#modal-close-x');
  if (closeBtn) closeBtn.onclick = closeModal;

  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeModal();
  };

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

export function closeModal() {
  const existing = document.getElementById('active-modal-backdrop');
  if (existing) {
    existing.classList.remove('open');
    setTimeout(() => {
      existing.remove();
      document.body.style.overflow = '';
    }, 150);
  }
  document.body.style.overflow = '';
}

// Bind to window for inline onclick handlers across views
if (typeof window !== 'undefined') {
  window.closeModal = closeModal;
}
