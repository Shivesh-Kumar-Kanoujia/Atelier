// Atelier Global Footer Component
export function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container-max" style="display: flex; flex-direction: column; gap: 2.5rem;">
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2rem; align-items: baseline;">
          <div style="max-width: 440px;">
            <div style="font-family: var(--font-headline); font-size: 20px; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem;">
              ATELIER
            </div>
            <p class="font-body-sm" style="color: var(--color-on-surface-variant); line-height: 1.6;">
              Curated marketplace for generative filmmakers, AI cinematographers, and innovative brands. Preserving provenance, elevating prompt direction, and connecting visionaries.
            </p>
          </div>

          <div style="display: flex; gap: 3.5rem; flex-wrap: wrap;">
            <div>
              <div class="font-label-tag" style="color: var(--color-on-surface); margin-bottom: 0.75rem; letter-spacing: 0.08em;">
                Navigation
              </div>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 13px;">
                <li><a href="#explore" class="hover-underline" style="color: var(--color-on-surface-variant);">Explore Creators</a></li>
                <li><a href="#dashboard" class="hover-underline" style="color: var(--color-on-surface-variant);">Company Dashboard</a></li>
                <li><a href="#brief/brief-solaar-ev" class="hover-underline" style="color: var(--color-on-surface-variant);">Open Briefs</a></li>
                <li><a href="#post-brief" class="hover-underline" style="color: var(--color-on-surface-variant);">Post a Brief</a></li>
              </ul>
            </div>

            <div>
              <div class="font-label-tag" style="color: var(--color-on-surface); margin-bottom: 0.75rem; letter-spacing: 0.08em;">
                Featured Roster
              </div>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 13px;">
                <li><a href="#profile/elena-vance" style="color: var(--color-on-surface-variant);">Elena Vance (AI Filmmaker)</a></li>
                <li><a href="#profile/kaelen-chen" style="color: var(--color-on-surface-variant);">Kaelen Chen (3D & Neural)</a></li>
                <li><a href="#profile/studio-numen" style="color: var(--color-on-surface-variant);">Studio Numen (Narrative)</a></li>
                <li><a href="#profile/aria-thorne" style="color: var(--color-on-surface-variant);">Aria Thorne (Concept Fashion)</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid var(--color-surface-container-high); padding-top: 1.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; font-size: 11px; color: var(--color-outline); letter-spacing: 0.04em;">
          <span>© 2025 ATELIER INC. ALL RIGHTS RESERVED.</span>
          <span style="letter-spacing: 0.1em; text-transform: uppercase;">STUDENT PROJECT MVP • HACKATHON EDITION</span>
        </div>
      </div>
    </footer>
  `;
}
