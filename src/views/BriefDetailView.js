// Screen 5: Brief Detail with Explainable Recommendations & Tender Proposals
import { store } from '../data/store.js';
import { showToast } from '../components/Toast.js';
import { openModal } from '../components/Modal.js';

export function renderBriefDetailView(briefId = 'brief-solaar-ev') {
  const brief = store.getBrief(briefId) || store.getBrief('brief-solaar-ev') || store.getBriefs()[0];
  if (!brief) {
    return `
      <div class="container-max" style="padding: 4rem 1rem; text-align: center;">
        <h2 class="font-headline-md" style="color: var(--color-primary);">Brief not found</h2>
        <a href="#dashboard" class="btn btn-primary" style="margin-top: 1rem;">Back to Dashboard</a>
      </div>
    `;
  }

  const recommendations = store.getRecommendedCreatorsForBrief(brief, 3);
  const proposals = store.getProposals(brief.id);

  return `
    <div class="brief-detail-page" style="padding-bottom: 6rem;">
      <!-- Breadcrumb Bar -->
      <div style="background: var(--color-surface); border-bottom: 1px solid var(--color-surface-container); padding: 0.75rem 0;">
        <div class="container-max" style="display: flex; align-items: center; gap: 0.5rem; font-size: 13px; color: var(--color-on-surface-variant);">
          <a href="#dashboard" class="hover-underline">Dashboard</a>
          <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
          <span style="color: var(--color-primary); font-weight: 600;">${brief.title}</span>
        </div>
      </div>

      <!-- Header Banner -->
      <section class="container-max" style="padding-top: 2rem; padding-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem;">
          <div style="max-width: 860px; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
              <span class="badge ${brief.status === 'in_production' ? 'badge-secondary' : 'badge-primary'}" style="font-size: 11px;">
                ${brief.statusLabel || 'Reviewing Pitches'}
              </span>
              <span class="font-label-tag" style="color: var(--color-secondary); display: flex; align-items: center; gap: 3px;">
                <span class="material-symbols-outlined" style="font-size: 14px;">event</span>
                <span>Deadline: ${brief.deadlineFormatted || brief.deadline || 'Oct 28'}</span>
              </span>
              <span class="badge badge-outline" style="font-size: 10.5px;">
                ${brief.commercialRights || 'Full Commercial Rights'}
              </span>
            </div>

            <h1 class="font-headline-lg" style="margin: 0; color: var(--color-primary);">
              ${brief.title}
            </h1>

            <p class="font-body-md" style="margin: 0; color: var(--color-on-surface-variant);">
              Commissioned by <strong style="color: var(--color-on-surface);">${brief.client}</strong> • Reference Code: <span class="font-label-tag" style="color: var(--color-primary);">${brief.code}</span>
            </p>
          </div>

          <!-- Actions -->
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <button class="btn btn-outline" id="edit-brief-btn" style="font-size: 13px;">
              <span class="material-symbols-outlined" style="font-size: 16px;">edit_note</span>
              <span>Edit Brief</span>
            </button>
            <button class="btn btn-outline" id="share-brief-btn" style="font-size: 13px;">
              <span class="material-symbols-outlined" style="font-size: 16px;">share</span>
              <span>Share Brief</span>
            </button>
            <a href="#proposals-section" class="btn btn-primary" style="font-size: 13px;">
              <span class="material-symbols-outlined" style="font-size: 16px;">mark_email_read</span>
              <span>Review Pitches (${proposals.length})</span>
            </a>
          </div>
        </div>
      </section>

      <!-- Main Two-Column Split (Specification vs Recommendations) -->
      <section class="container-max" style="margin-bottom: 4rem;">
        <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 2.5rem; align-items: start;">
          <!-- LEFT COLUMN: Brief Specifications (7 cols) -->
          <div style="grid-column: span 12; display: flex; flex-direction: column; gap: 2rem;" id="brief-spec-left-col">
            <style>
              @media (min-width: 1024px) {
                #brief-spec-left-col { grid-column: span 7 !important; }
                #brief-recs-right-col { grid-column: span 5 !important; }
              }
            </style>

            <!-- Creative Overview Card -->
            <div class="card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="font-label-tag" style="color: var(--color-secondary); letter-spacing: 0.12em;">Brief Scope & Purpose</span>
                <span class="font-label-tag" style="color: var(--color-outline);">${brief.code}</span>
              </div>
              <h2 class="font-headline-sm" style="color: var(--color-on-surface); margin: 0;">Creative Overview</h2>
              <p class="font-body-lg" style="line-height: 1.6; margin: 0;">
                ${brief.description}
              </p>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
                <div class="card" style="padding: 1.25rem; background: var(--color-surface-container-low); display: flex; flex-direction: column; gap: 0.25rem;">
                  <span class="font-label-tag" style="color: var(--color-secondary);">Campaign Objective</span>
                  <div class="font-title-editorial" style="color: var(--color-on-surface); font-size: 15px;">
                    ${brief.objective}
                  </div>
                  <span class="font-body-sm" style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
                    High retention visual hook with signature cinematic lighting.
                  </span>
                </div>

                <div class="card" style="padding: 1.25rem; background: var(--color-surface-container-low); display: flex; flex-direction: column; gap: 0.25rem;">
                  <span class="font-label-tag" style="color: var(--color-secondary);">Content Format</span>
                  <div class="font-title-editorial" style="color: var(--color-on-surface); font-size: 15px;">
                    ${brief.contentType}
                  </div>
                  <span class="font-body-sm" style="font-size: 12px; color: var(--color-on-surface-variant); margin-top: 2px;">
                    Full master cut plus 3 vertical social cutdowns.
                  </span>
                </div>
              </div>
            </div>

            <!-- Visual Style & References Matrix -->
            <div class="card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <span class="font-label-tag" style="color: var(--color-secondary); letter-spacing: 0.12em;">Visual Style & References</span>
                  <h3 class="font-headline-sm" style="color: var(--color-on-surface); margin: 0.25rem 0 0; font-size: 18px;">
                    ${(brief.styles || []).join(' • ')}
                  </h3>
                </div>
                <span class="badge badge-neutral">${(brief.referenceImages || []).length} Reference Stills</span>
              </div>

              <!-- Stills Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                ${(brief.referenceImages || []).map(still => `
                  <div class="card card-lift" style="overflow: hidden; display: flex; flex-direction: column;">
                    <div style="aspect-ratio: 16/10; overflow: hidden; background: #000;">
                      <img src="${still.image}" alt="${still.title}" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <div style="padding: 0.75rem; background: #fff; display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div class="font-title-editorial" style="font-size: 13px; color: var(--color-on-surface);">${still.title}</div>
                        <div class="font-label-tag" style="font-size: 9.5px; color: var(--color-outline);">${still.subtitle}</div>
                      </div>
                      <span class="material-symbols-outlined" style="font-size: 16px; color: var(--color-outline);">photo_camera</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Production Requirements & Toolchain Specs -->
            <div class="card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span class="font-label-tag" style="color: var(--color-secondary); letter-spacing: 0.12em;">Production Requirements</span>
                  <h3 class="font-headline-sm" style="color: var(--color-on-surface); margin: 0.25rem 0 0; font-size: 18px;">Deliverables & Toolchain</h3>
                </div>
                <span class="badge badge-success">Production Spec</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
                <div class="card" style="padding: 1rem; background: var(--color-surface-container-low);">
                  <span class="font-label-tag" style="color: var(--color-on-surface-variant);">Required Deliverables</span>
                  <ul style="margin: 0.5rem 0 0; padding-left: 1.25rem; font-size: 12.5px; color: var(--color-on-surface); line-height: 1.6;">
                    ${(brief.deliverables || []).map(d => `<li>${d}</li>`).join('')}
                  </ul>
                </div>

                <div class="card" style="padding: 1rem; background: var(--color-surface-container-low);">
                  <span class="font-label-tag" style="color: var(--color-on-surface-variant);">Required AI Toolchains</span>
                  <div class="font-title-editorial" style="font-size: 14.5px; margin: 0.25rem 0 0.5rem; color: var(--color-primary);">
                    ${(brief.requiredTools || ['Runway Gen-3', 'ComfyUI']).join(' + ')}
                  </div>
                  <p class="font-body-sm" style="font-size: 11.5px; color: var(--color-on-surface-variant); margin: 0; line-height: 1.5;">
                    Preferred experience in consistent LoRA generation and temporal upscale stabilization.
                  </p>
                </div>

                <div class="card" style="padding: 1rem; background: var(--color-surface-container-low);">
                  <span class="font-label-tag" style="color: var(--color-on-surface-variant);">Audio & Sound Design</span>
                  <p class="font-body-sm" style="font-size: 12px; color: var(--color-on-surface); margin: 0.25rem 0 0; line-height: 1.45;">
                    ${brief.audioNotes || 'Synchronized sound design with organic ambience and high-fidelity bass tone.'}
                  </p>
                </div>

                <div class="card" style="padding: 1rem; background: var(--color-surface-container-low);">
                  <span class="font-label-tag" style="color: var(--color-secondary);">Commercial Rights</span>
                  <div class="font-title-editorial" style="font-size: 14.5px; margin: 0.25rem 0 0.25rem; color: var(--color-primary);">
                    ${brief.commercialRights || 'Full Commercial Rights'}
                  </div>
                  <p class="font-body-sm" style="font-size: 11.5px; color: var(--color-on-surface-variant); margin: 0;">
                    ${brief.commercialRightsSummary || 'Commercial rights assigned upon final milestone completion.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Explainable AI Creator Matches (5 cols) -->
          <div style="grid-column: span 12; display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 96px;" id="brief-recs-right-col">
            <!-- Explainable Matching Header Card -->
            <div style="background: var(--color-primary-container); color: var(--color-on-primary); padding: 1.5rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-card);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--color-primary-fixed); letter-spacing: 0.1em;">
                  <span class="material-symbols-outlined" style="font-size: 16px;">auto_awesome</span>
                  <span>Explainable AI Matching</span>
                </span>
                <span class="badge" style="background: rgba(192, 237, 212, 0.25); color: #fff; font-size: 10px;">
                  ${recommendations.length} Direct Matches
                </span>
              </div>
              <h2 class="font-headline-sm" style="margin: 0; color: #fff; font-size: 20px;">Recommended Creators</h2>
              <p class="font-body-sm" style="color: var(--color-on-primary-container); margin: 0; font-size: 12.5px; line-height: 1.45;">
                Every recommendation provides an explainable breakdown based on weighted skills, AI models, output formats, and current availability.
              </p>
            </div>

            <!-- Ranked Creators List -->
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              ${recommendations.map(({ creator, match }, idx) => `
                <div class="card card-lift" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
                  <!-- Top Row -->
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img 
                        src="${creator.avatar}" 
                        alt="${creator.name}" 
                        style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;"
                      />
                      <div>
                        <div style="display: flex; align-items: center; gap: 4px;">
                          <h4 class="font-title-editorial" style="margin: 0; font-size: 16px; color: var(--color-primary);">
                            <a href="#profile/${creator.id}" class="hover-underline" style="color: inherit;">${creator.name}</a>
                          </h4>
                          <span class="material-symbols-outlined" style="color: var(--color-secondary-gold); font-size: 16px;">verified</span>
                        </div>
                        <div class="font-label-md" style="color: var(--color-on-surface-variant); font-size: 11.5px;">${creator.title}</div>
                        <div class="font-label-tag" style="color: var(--color-secondary); font-size: 10px; margin-top: 1px;">
                          ★ ${creator.stats.rating} • ${creator.stats.completedProjects} Projects Delivered
                        </div>
                      </div>
                    </div>

                    <div style="text-align: right; shrink-0;">
                      <span class="badge badge-secondary" style="font-size: 12px; font-weight: 700; padding: 3px 8px;">
                        ${match.score}% Match
                      </span>
                      <span class="font-label-tag" style="color: var(--color-outline); font-size: 9.5px; display: block; margin-top: 2px;">
                        ${idx === 0 ? 'Prime Fit' : (idx === 1 ? 'Physics Specialist' : 'Narrative Scope')}
                      </span>
                    </div>
                  </div>

                  <!-- Explainability Breakdown Tags -->
                  <div style="background: var(--color-surface-container-low); padding: 0.75rem; border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 0.4rem;">
                    <div class="font-label-tag" style="color: var(--color-secondary); font-size: 10px; display: flex; align-items: center; gap: 4px;">
                      <span class="material-symbols-outlined" style="font-size: 13px;">psychology</span>
                      <span>Explainable Match Breakdown</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                      ${match.breakdown.map(item => `
                        <span class="badge ${item.highlight ? 'badge-primary' : 'badge-neutral'}" style="font-size: 10px; text-transform: none; font-weight: 500; display: inline-flex; align-items: center; gap: 3px;">
                          <span class="material-symbols-outlined" style="font-size: 12px;">${item.icon}</span>
                          <span>${item.text}</span>
                        </span>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Recent Work Sample -->
                  ${creator.portfolio?.[0] ? `
                    <div>
                      <div class="font-label-tag" style="color: var(--color-outline); font-size: 9.5px; margin-bottom: 4px;">Recent Relevant Work:</div>
                      <div style="aspect-ratio: 16/9; border-radius: var(--radius-sm); overflow: hidden; position: relative; background: #000;">
                        <img src="${creator.portfolio[0].image}" alt="Work Sample" style="width: 100%; height: 100%; object-fit: cover;" />
                        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%); display: flex; align-items: flex-end; padding: 0.5rem;">
                          <div style="color: #fff;">
                            <div class="font-label-tag" style="color: rgba(255,255,255,0.8); font-size: 9px;">Video Reel Preview</div>
                            <div class="font-title-editorial" style="font-size: 12px; color: #fff;">${creator.portfolio[0].title}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ` : ''}

                  <!-- Rate & Actions -->
                  <div style="border-top: 1px solid var(--color-surface-container); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 12.5px;">
                      Rate: <strong style="color: var(--color-primary); font-size: 13px;">${creator.rateDisplay}/spot</strong>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <a href="#profile/${creator.id}" class="btn btn-outline" style="font-size: 11.5px; padding: 0.35rem 0.65rem;">
                        View Profile
                      </a>
                      <button class="btn btn-primary invite-pitch-btn" data-creator-id="${creator.id}" data-creator-name="${creator.name}" style="font-size: 11.5px; padding: 0.35rem 0.85rem;">
                        Invite to Pitch
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Workspace: Received Proposals Section -->
      <section class="container-max" id="proposals-section" style="padding-top: 2rem;">
        <div class="card" style="padding: 2.5rem; background: var(--color-surface-container-low); display: flex; flex-direction: column; gap: 2rem;">
          <!-- Section Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="font-label-tag" style="color: var(--color-secondary); letter-spacing: 0.12em;">Tender Administration</span>
              <h2 class="font-headline-lg" style="color: var(--color-primary); margin: 0.25rem 0 0.5rem;">
                Proposals Received (${proposals.length})
              </h2>
              <p class="font-body-md" style="color: var(--color-on-surface-variant); margin: 0;">
                Submitted director treatments with estimated turnaround schedules and fixed fee quotes.
              </p>
            </div>

            <!-- Filter Tabs -->
            <div style="display: flex; background: #fff; padding: 4px; border-radius: var(--radius-md); gap: 4px;" id="proposal-filter-tabs">
              <button class="prop-tab-btn active" data-tab="all" style="border: none; background: var(--color-primary); color: #fff; padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12.5px; font-weight: 600; cursor: pointer;">
                All Proposals (${proposals.length})
              </button>
              <button class="prop-tab-btn" data-tab="shortlisted" style="border: none; background: transparent; color: var(--color-on-surface-variant); padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12.5px; font-weight: 500; cursor: pointer;">
                Shortlisted (${proposals.filter(p => p.shortlisted).length})
              </button>
            </div>
          </div>

          <!-- Proposals List -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;" id="proposals-list-container">
            ${proposals.map(p => renderProposalCard(p)).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderProposalCard(p) {
  const isAccepted = (p.status === 'accepted');

  return `
    <article class="card proposal-card" data-shortlisted="${p.shortlisted ? 'true' : 'false'}" style="padding: 1.75rem; background: #fff; display: flex; flex-direction: column; gap: 1.25rem; ${isAccepted ? 'border: 2px solid var(--color-primary);' : ''}">
      <!-- Header Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--color-surface-container); padding-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="${p.creatorAvatar}" alt="${p.creatorName}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover;" />
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <h3 class="font-headline-sm" style="margin: 0; font-size: 18px; color: var(--color-on-surface);">${p.creatorName} — ${p.pitchTitle}</h3>
              ${p.isTopMatch ? `
                <span class="badge badge-success" style="font-size: 10px;">${p.badgeText}</span>
              ` : `
                <span class="badge badge-secondary" style="font-size: 10px;">${p.badgeText || 'SPECIALIST'}</span>
              `}
              ${isAccepted ? `
                <span class="badge" style="background: var(--color-primary); color: #fff; font-size: 10px;">PROPOSAL ACCEPTED</span>
              ` : ''}
            </div>
            <p class="font-body-sm" style="margin: 3px 0 0; color: var(--color-on-surface-variant); font-size: 12.5px;">
              Submitted ${p.submittedTime} • Turnaround Estimate: <strong style="color: var(--color-on-surface);">${p.turnaround}</strong>
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1.5rem;">
          <div style="text-align: right;">
            <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px; display: block;">Quoted Fee</span>
            <div class="font-headline-sm" style="color: var(--color-primary); font-weight: 700; font-size: 22px;">
              ${p.quoteDisplay} <span style="font-size: 12px; font-weight: 400; color: var(--color-outline);">USD</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button class="btn btn-surface review-treatment-btn" data-prop-id="${p.id}" style="font-size: 13px;">
              <span class="material-symbols-outlined" style="font-size: 16px;">visibility</span>
              <span>Review Treatment</span>
            </button>

            ${!isAccepted ? `
              <button class="btn btn-primary accept-proposal-btn" data-prop-id="${p.id}" style="font-size: 13px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">task_alt</span>
                <span>Accept Proposal</span>
              </button>
            ` : `
              <button class="btn btn-primary" disabled style="opacity: 0.8; font-size: 13px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">done_all</span>
                <span>Assigned & Active</span>
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- Treatment Summary & Mood Reel Preview -->
      <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; align-items: center;">
        <div style="grid-column: span 12; display: flex; flex-direction: column; gap: 0.75rem;" class="pitch-summary-col">
          <style>
            @media (min-width: 900px) {
              .pitch-summary-col { grid-column: span 8 !important; }
              .pitch-reel-col { grid-column: span 4 !important; }
            }
          </style>
          <p class="font-body-md" style="color: var(--color-on-surface-variant); line-height: 1.6; margin: 0;">
            “${p.summary}”
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; color: var(--color-on-surface-variant); font-size: 12px; padding-top: 0.25rem;">
            <span style="display: flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 16px;">movie</span>
              <span>${p.deliverablesSummary}</span>
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 16px;">description</span>
              <span style="text-decoration: underline;">${p.attachmentName}</span>
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 16px;">auto_fix_high</span>
              <span>${p.tools.join(' + ')}</span>
            </span>
          </div>
        </div>

        <div style="grid-column: span 12;" class="pitch-reel-col">
          <div style="aspect-ratio: 16/9; border-radius: var(--radius-md); overflow: hidden; position: relative; background: #000;">
            <img src="${p.moodReelImage}" alt="Mood Reel" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <button 
                class="play-reel-trigger-btn"
                data-item-title="${p.creatorName} — Mood Treatment"
                data-item-img="${p.moodReelImage}"
                data-item-workflow="${p.summary}"
                data-item-tools="${p.tools.join(', ')}"
                style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; cursor: pointer; color: var(--color-primary); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);"
                title="Play Mood Reel"
              >
                <span class="material-symbols-outlined" style="font-size: 24px; margin-left: 2px;">play_arrow</span>
              </button>
            </div>
            <div style="position: absolute; bottom: 6px; left: 8px; font-size: 9.5px; color: #fff; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 2px; text-transform: uppercase; font-weight: 600;">
              Treatment Mood Reel
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

export function initBriefDetailLogic(briefId = 'brief-solaar-ev') {
  const brief = store.getBrief(briefId) || store.getBrief('brief-solaar-ev') || store.getBriefs()[0];
  if (!brief) return;

  // Invite to Pitch
  document.querySelectorAll('.invite-pitch-btn').forEach(btn => {
    btn.onclick = () => {
      const creatorName = btn.dataset.creatorName;
      btn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">check</span> Invited`;
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-surface');
      showToast(`Formal invitation sent to ${creatorName}!`, 'mail');
    };
  });

  // Proposal Tabs (All vs Shortlisted)
  document.querySelectorAll('.prop-tab-btn').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.prop-tab-btn').forEach(t => {
        t.style.background = 'transparent';
        t.style.color = 'var(--color-on-surface-variant)';
      });
      tab.style.background = 'var(--color-primary)';
      tab.style.color = '#fff';

      const filter = tab.dataset.tab;
      document.querySelectorAll('.proposal-card').forEach(card => {
        if (filter === 'all' || card.dataset.shortlisted === 'true') {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    };
  });

  // Review Treatment Modal
  document.querySelectorAll('.review-treatment-btn').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.propId;
      const prop = store.getProposals().find(p => p.id === pid);
      if (!prop) return;

      openModal({
        title: `Director Treatment Deck`,
        subtitle: `${prop.creatorName} • ${prop.pitchTitle}`,
        maxWidth: '700px',
        contentHtml: `
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="aspect-ratio: 16/9; border-radius: var(--radius-md); overflow: hidden; background: #000; position: relative;">
              <img src="${prop.moodReelImage}" alt="Treatment Reel" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.8); color: #fff; padding: 4px 10px; border-radius: var(--radius-xs); font-size: 11px;">
                Attached Treatment Deck: ${prop.attachmentName}
              </div>
            </div>

            <div class="card" style="padding: 1.25rem; background: var(--color-surface-container-low);">
              <span class="font-label-tag" style="color: var(--color-secondary); display: block; margin-bottom: 0.4rem;">Treatment Synopsis</span>
              <p style="margin: 0; line-height: 1.6; color: var(--color-on-surface); font-size: 14px;">
                ${prop.summary}
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; font-size: 12.5px;">
              <div class="card" style="padding: 0.75rem;">
                <span class="font-label-tag" style="color: var(--color-outline); font-size: 9.5px;">Fee</span>
                <strong style="color: var(--color-primary); display: block;">${prop.quoteDisplay} USD</strong>
              </div>
              <div class="card" style="padding: 0.75rem;">
                <span class="font-label-tag" style="color: var(--color-outline); font-size: 9.5px;">Schedule</span>
                <strong style="color: var(--color-on-surface); display: block;">${prop.turnaround}</strong>
              </div>
              <div class="card" style="padding: 0.75rem;">
                <span class="font-label-tag" style="color: var(--color-outline); font-size: 9.5px;">Deliverables</span>
                <strong style="color: var(--color-secondary); display: block;">${prop.deliverablesSummary}</strong>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.75rem; padding-bottom: 0.75rem; position: sticky; bottom: -1rem; background: var(--color-surface-container-lowest); padding-top: 0.75rem; border-top: 1px solid var(--color-surface-container);">
              <button type="button" class="btn btn-outline" onclick="if (window.closeModal) window.closeModal(); else document.getElementById('active-modal-backdrop')?.remove();">Close</button>
              <button type="button" class="btn btn-primary" onclick="if (window.closeModal) window.closeModal(); else document.getElementById('active-modal-backdrop')?.remove(); document.querySelector('.accept-proposal-btn[data-prop-id=\\'${prop.id}\\']')?.click();">
                Accept This Pitch
              </button>
            </div>
          </div>
        `
      });
    };
  });

  // Accept Proposal
  document.querySelectorAll('.accept-proposal-btn').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.propId;
      const prop = store.getProposals().find(p => p.id === pid);
      if (!prop) return;

      const success = store.acceptProposal(pid);
      if (success) {
        showToast(`Accepted proposal from ${prop.creatorName}! Project is now in production.`, 'task_alt', 4000);
        setTimeout(() => {
          window.location.reload();
        }, 600);
      }
    };
  });

  // Share Brief Link
  const shareBtn = document.getElementById('share-brief-btn');
  if (shareBtn) {
    shareBtn.onclick = () => {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Brief link copied to clipboard', 'content_copy');
    };
  }

  // Edit Brief
  const editBtn = document.getElementById('edit-brief-btn');
  if (editBtn) {
    editBtn.onclick = () => {
      showToast('Opening brief editor...', 'edit_note');
      window.location.hash = '#post-brief';
    };
  }
}
