// Screen 3: Post a Creative Brief — Project Creation (MVP)
import { store } from '../data/store.js';
import { showToast } from '../components/Toast.js';
import { openModal } from '../components/Modal.js';

export function renderPostBriefView() {
  const draft = store.getDraftBrief() || {
    title: "Zenith Chronograph — Mechanical Pulse",
    client: "Zenith Watches",
    objective: "Brand Awareness",
    contentType: "AI Commercial / Video Spot",
    description: "A hyper-precise study of the human pulse versus the mechanical heart of an automatic escapement. Macro optical reflections open into architectural minimalism under twilight alpine skies.",
    styles: ["Cinematic 35mm", "Futuristic Photorealism"],
    aspectRatios: ["16:9 Widescreen", "9:16 Vertical"],
    deliverables: ["Master 4K Video Render", "15s Cutdowns", "Clean Stills / Keyframes"],
    deadline: "2025-04-15",
    budgetTier: "$3,000 – $6,000 USD (Standard Project)",
    commercialUse: "Full Commercial Rights",
    referenceLinks: ["https://vimeo.com/channels/cinematography-luxury"]
  };

  return `
    <div class="post-brief-page" style="padding-top: 1.5rem; padding-bottom: 5rem;">
      <!-- Header Banner -->
      <section class="container-max" style="margin-bottom: 2rem;">
        <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 800px;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-secondary-gold); display: inline-block;"></span>
            <span class="font-label-tag" style="color: var(--color-secondary); letter-spacing: 0.15em;">Creative Brief Builder</span>
          </div>
          <h1 class="font-display-hero">Post a Creative Brief</h1>
          <p class="font-body-lg">
            Define project parameters, aesthetic references, and commercial deliverables to commission curated AI filmmakers and prompt artists.
          </p>
        </div>
      </section>

      <!-- Main Form & Live Preview Layout -->
      <section class="container-max">
        <form id="post-brief-form" style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 2.5rem; align-items: start;">
          <!-- LEFT FORM COLUMN (8 cols) -->
          <div style="grid-column: span 12; display: flex; flex-direction: column; gap: 2rem;" id="brief-form-left-col">
            <style>
              @media (min-width: 1024px) {
                #brief-form-left-col { grid-column: span 8 !important; }
                #brief-preview-right-col { grid-column: span 4 !important; }
              }
            </style>

            <!-- Section 1: Project Scope & Core Parameters -->
            <div class="card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-surface-container); padding-bottom: 0.75rem;">
                <h2 class="font-headline-sm" style="color: var(--color-primary); margin: 0;">1. Project Scope & Purpose</h2>
                <span class="font-label-tag" style="color: var(--color-outline);">Step 1 of 3</span>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
                <div style="grid-column: span 2;">
                  <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem; color: var(--color-on-surface);">
                    Project Title & Working Name <span style="color: var(--color-secondary);">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="brief-title-input" 
                    class="input" 
                    required 
                    placeholder="e.g. Zenith Chronograph — Mechanical Pulse" 
                    value="${draft.title || ''}" 
                  />
                </div>

                <div>
                  <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem; color: var(--color-on-surface);">
                    Client / Brand Name <span style="color: var(--color-secondary);">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="brief-client-input" 
                    class="input" 
                    required 
                    placeholder="e.g. Zenith Watches" 
                    value="${draft.client || ''}" 
                  />
                </div>

                <div>
                  <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem; color: var(--color-on-surface);">
                    Campaign Objective
                  </label>
                  <select id="brief-objective-select" class="select">
                    <option ${draft.objective === 'Brand Awareness' ? 'selected' : ''}>Brand Awareness</option>
                    <option ${draft.objective === 'Product Launch' ? 'selected' : ''}>Product Launch</option>
                    <option ${draft.objective === 'Social Teaser' ? 'selected' : ''}>Social Teaser</option>
                    <option ${draft.objective === 'Narrative Film' ? 'selected' : ''}>Narrative Film</option>
                  </select>
                </div>

                <div style="grid-column: span 2;">
                  <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem; color: var(--color-on-surface);">
                    Content Type
                  </label>
                  <select id="brief-content-type-select" class="select">
                    <option ${draft.contentType === 'AI Commercial / Video Spot' ? 'selected' : ''}>AI Commercial / Video Spot</option>
                    <option ${draft.contentType === 'Social Media Cuts' ? 'selected' : ''}>Social Media Cuts</option>
                    <option ${draft.contentType === 'Generative Stills' ? 'selected' : ''}>Generative Stills</option>
                    <option ${draft.contentType === 'Animated Visualizer' ? 'selected' : ''}>Animated Visualizer</option>
                  </select>
                </div>

                <div style="grid-column: span 2;">
                  <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem; color: var(--color-on-surface);">
                    Project Description & Narrative Guidelines
                  </label>
                  <textarea 
                    id="brief-description-input" 
                    class="textarea" 
                    rows="4" 
                    placeholder="Describe the concept, mood, target pacing, subject matter, and key visual moments..."
                  >${draft.description || ''}</textarea>
                  <span class="font-body-sm" style="font-size: 12px; color: var(--color-outline); margin-top: 4px; display: block;">
                    Provide clear narrative notes, pacing references, or required visual hooks.
                  </span>
                </div>
              </div>
            </div>

            <!-- Section 2: Visual Style & References -->
            <div class="card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-surface-container); padding-bottom: 0.75rem;">
                <h2 class="font-headline-sm" style="color: var(--color-primary); margin: 0;">2. Visual Style & References</h2>
                <span class="font-label-tag" style="color: var(--color-outline);">Step 2 of 3</span>
              </div>

              <!-- Visual Style Checkbox Cards -->
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.75rem; color: var(--color-on-surface);">
                  Visual Style (Select one or more)
                </label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem;" id="style-cards-group">
                  ${[
                    { name: 'Cinematic 35mm', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwqPK5N99YgN6C3cQHFxni2mp209fWDa5JjlhYep8sMKe647OGwagUWE7EbruYFPYwjV3OQTnidM8Epx2518s8HV1Wr14rQGQQu1TekyCPqbwj8hIbRVugZ3rrbEVheJPcu8XYnykclOLXSINdLXjcOI-t2cUlGWVVwyDahCxQL3VsV12zK6ncV1tokVsecj1-4pBFRYIeYaLtdq3ex1PjOknp_nJmu7S8V5T7s_Y3d7fKnoyubzkt4g' },
                    { name: 'Futuristic Photorealism', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-7l8xJOxNjn4nfvaV50tUY32efuAM76UGIwyhElU0xpS7-_jBkkQgymQ3J4kQThnwziD8AcjqfxgExvMeBHepKPkEd_s7RzgLuf6OlWp4C2sx7PsR4LupFho_ak9elvJyksmLhcMz6dSd8S86hGKhLlevIas7ZOs3t6YdQvb8FV5mjANIujgVo1DagOxo0qQs8Q6o5txwFH7pNVPXVz99J2Npu0nYFwxFWFLkwu6MrOF_vOBkClU7Pg' },
                    { name: 'Surreal Editorial', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCsdDiZhWR59DHY3RjagT0mSx_LiWK2vfO-qQfBMomyPyOq038yf5xm2VGflPEZTaCrtNJAtTYB6bsIohH1F4WMLOAgzRXX4aXuYOhD6xKotnWcprhtRsS6kbNvelx5TUnhAWUbCEbqeAfd4dE-P_lt4NNnqN9K6iXzGYYvVsgBWnxMXF0YRFDK_zzC90LHHw9n6AVpuRV79-5perBhy1RK2knFl1UiHs3dE02nzFZuElgtuvtVht1oA' },
                    { name: 'Minimalist Product', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi7Y_UX9vlWQIwq0kRJUB6zc170XAE19EUykK-7PvMsjh8b4-HMzmFmt4f1eGTnsh-fnSuL4nubtX_fnYiN_pwiPGSE4BUzCZZiYw4VNrS95gX-9BKqcIi3OdBVc-U-6gAlVHgyy5DrZuEl7NATFH0P3ZWBfZsjtK5ynTHNBA0d2LKT-MhoWOXVoy_A2k5eFv6hpnsMC2aKYnBaRIietylr0nlV94Q1Kqu4YX9hkkjKHzTfxfm7QwVBQ' },
                    { name: '3D Neural Motion', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCvMGWQIBKrEcCAn56v8RekEcnC2btwb9tDDxP1ENkrTA6yZd0rP0a6jdV7OuX_Mqp60m-Dp9n7hwqNvZvbJPMGfJg8z-yG_b_pM83X_AtBU1UXtwKz6DlUrSoWt6_HJ1aP8_XwugLMz7uIBaybVkV5miZnUV6HphwS9RzM5H-XIzRb2ICcRTSwgNw2fgt-MlZOnN1gTgiFhpIa7_WNExsBNc2aiz7lK272mADRnymCO5P8wfHVmA4tQ' }
                  ].map(style => {
                    const isChecked = (draft.styles || []).includes(style.name);
                    return `
                      <label style="cursor: pointer;" class="style-choice-item">
                        <input type="checkbox" name="style_choice" value="${style.name}" ${isChecked ? 'checked' : ''} style="display: none;" />
                        <div class="card" style="padding: 6px; border: 2px solid ${isChecked ? 'var(--color-secondary-gold)' : 'transparent'}; background: ${isChecked ? 'rgba(255, 221, 183, 0.3)' : 'var(--color-surface-container-low)'}; transition: all 0.2s;">
                          <div style="aspect-ratio: 16/10; overflow: hidden; border-radius: var(--radius-sm); margin-bottom: 6px; position: relative;">
                            <img src="${style.img}" alt="${style.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                            <span class="material-symbols-outlined checkmark-icon" style="position: absolute; top: 4px; right: 4px; background: var(--color-secondary-gold); color: #fff; border-radius: 50%; font-size: 14px; padding: 2px; display: ${isChecked ? 'inline-block' : 'none'};">check</span>
                          </div>
                          <div class="font-label-md" style="text-align: center; font-size: 11px; line-height: 1.25; color: var(--color-on-surface); font-weight: 600;">
                            ${style.name}
                          </div>
                        </div>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Reference Link Input -->
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem; color: var(--color-on-surface);">
                  Reference Links / Moodboard
                </label>
                <div style="display: flex; gap: 0.5rem;">
                  <div style="flex: 1; position: relative; display: flex; align-items: center;">
                    <span class="material-symbols-outlined" style="position: absolute; left: 0.75rem; color: var(--color-outline); font-size: 18px;">link</span>
                    <input 
                      type="url" 
                      id="brief-ref-link-input" 
                      class="input" 
                      style="padding-left: 2.25rem;" 
                      placeholder="https://vimeo.com/... or Behance / Pinterest moodboard"
                      value="${draft.referenceLinks?.[0] || 'https://vimeo.com/channels/cinematography-luxury'}"
                    />
                  </div>
                  <button type="button" id="add-ref-link-btn" class="btn btn-surface" style="font-size: 13px;">
                    <span class="material-symbols-outlined" style="font-size: 16px;">add</span> Add Link
                  </button>
                </div>
                <div id="ref-links-list" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;"></div>
              </div>

              <!-- Target Aspect Ratios -->
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.5rem; color: var(--color-on-surface);">
                  Target Aspect Ratio
                </label>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;" id="aspect-ratios-group">
                  ${[
                    { val: '16:9 Widescreen', icon: 'aspect_ratio' },
                    { val: '9:16 Vertical', icon: 'crop_portrait' },
                    { val: '1:1 Square', icon: 'crop_square' },
                    { val: '2.39:1 Anamorphic', icon: 'panorama' }
                  ].map(ar => {
                    const checked = (draft.aspectRatios || []).includes(ar.val);
                    return `
                      <label style="cursor: pointer;" class="ar-choice-item">
                        <input type="checkbox" name="ar_choice" value="${ar.val}" ${checked ? 'checked' : ''} style="display: none;" />
                        <span class="badge ${checked ? 'badge-primary' : 'badge-neutral'}" style="padding: 6px 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; border-radius: var(--radius-sm);">
                          <span class="material-symbols-outlined" style="font-size: 16px;">${ar.icon}</span>
                          <span>${ar.val}</span>
                        </span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Section 3: Deliverables, Timeline & Terms -->
            <div class="card" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-surface-container); padding-bottom: 0.75rem;">
                <h2 class="font-headline-sm" style="color: var(--color-primary); margin: 0;">3. Deliverables & Terms</h2>
                <span class="font-label-tag" style="color: var(--color-outline);">Step 3 of 3</span>
              </div>

              <!-- Required Deliverables Checkboxes -->
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.75rem; color: var(--color-on-surface);">
                  Required Deliverables
                </label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.75rem;" id="deliverables-group">
                  ${[
                    { title: 'Master 4K Video Render', desc: 'Full quality final master (ProRes / MP4)' },
                    { title: '15s Cutdowns', desc: 'Formatted for social reels and ads' },
                    { title: 'Clean Stills / Keyframes', desc: 'High-resolution stills from sequence' },
                    { title: 'Project Generation Log', desc: 'Prompt seeds and workflow notes' }
                  ].map(d => {
                    const isChecked = (draft.deliverables || []).includes(d.title);
                    return `
                      <label class="card" style="padding: 0.85rem; display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; background: var(--color-surface-container-low); transition: background 0.15s;">
                        <input type="checkbox" name="deliverable_choice" value="${d.title}" ${isChecked ? 'checked' : ''} style="margin-top: 3px; accent-color: var(--color-primary);" />
                        <div>
                          <strong class="font-label-md" style="display: block; color: var(--color-on-surface); font-size: 13px;">${d.title}</strong>
                          <span class="font-body-sm" style="color: var(--color-on-surface-variant); font-size: 11.5px;">${d.desc}</span>
                        </div>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Timeline & Budget -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
                <div>
                  <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem; color: var(--color-on-surface);">
                    Project Deadline <span style="color: var(--color-secondary);">*</span>
                  </label>
                  <input type="date" id="brief-deadline-input" class="input" value="${draft.deadline || '2025-04-15'}" required />
                </div>

                <div>
                  <label class="font-label-lg" style="display: block; margin-bottom: 0.4rem; color: var(--color-on-surface);">
                    Budget Range
                  </label>
                  <select id="brief-budget-select" class="select">
                    <option ${draft.budgetTier?.includes('1,000') ? 'selected' : ''}>$1,000 – $3,000 USD (Starter)</option>
                    <option ${draft.budgetTier?.includes('3,000') ? 'selected' : ''}>$3,000 – $6,000 USD (Standard Project)</option>
                    <option ${draft.budgetTier?.includes('6,000') ? 'selected' : ''}>$6,000 – $12,000 USD (Full Campaign)</option>
                    <option ${draft.budgetTier?.includes('12,000') ? 'selected' : ''}>$12,000+ USD (Custom Scope)</option>
                  </select>
                </div>
              </div>

              <!-- Commercial Rights -->
              <div>
                <label class="font-label-lg" style="display: block; margin-bottom: 0.75rem; color: var(--color-on-surface);">
                  Commercial-Use Requirements
                </label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;" id="commercial-use-group">
                  ${[
                    { val: 'Full Commercial Rights', desc: 'Marketing, paid campaigns & ads worldwide.' },
                    { val: 'Digital & Social Only', desc: 'Owned channels, social media & website.' },
                    { val: 'Non-Commercial / Portfolio', desc: 'Festival showcases and portfolio usage only.' }
                  ].map(c => {
                    const isChecked = (draft.commercialUse === c.val);
                    return `
                      <label class="card" style="padding: 0.85rem; display: flex; flex-direction: column; gap: 4px; cursor: pointer; background: ${isChecked ? 'rgba(255, 221, 183, 0.3)' : 'var(--color-surface-container-low)'}; border: 1px solid ${isChecked ? 'var(--color-secondary-gold)' : 'transparent'};">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                          <input type="radio" name="commercial_choice" value="${c.val}" ${isChecked ? 'checked' : ''} style="accent-color: var(--color-primary);" />
                          <strong class="font-label-md" style="font-size: 13px; color: var(--color-on-surface);">${c.val}</strong>
                        </div>
                        <span class="font-body-sm" style="font-size: 11.5px; color: var(--color-on-surface-variant); padding-left: 1.45rem;">${c.desc}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Action Console -->
            <div class="card" style="padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 13px; color: var(--color-on-surface-variant);">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                <span id="draft-status-text">Draft autosaved locally</span>
              </div>

              <div style="display: flex; align-items: center; gap: 1rem;">
                <button type="button" id="save-draft-btn" class="btn btn-surface">
                  Save Draft
                </button>
                <button type="submit" id="publish-brief-btn" class="btn btn-primary" style="padding: 0.65rem 1.75rem;">
                  <span>Publish Brief</span>
                  <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT PREVIEW SIDEBAR (4 cols) -->
          <aside style="grid-column: span 12; display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 96px;" id="brief-preview-right-col">
            <!-- Live Brief Summary Card -->
            <div class="card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-surface-container); padding-bottom: 0.6rem;">
                <h3 class="font-title-editorial" style="color: var(--color-primary); margin: 0; font-size: 17px;">Brief Summary</h3>
                <span class="badge badge-secondary" style="font-size: 10px;">Active Preview</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 13px;">
                <div>
                  <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px;">Project</span>
                  <div style="font-weight: 700; color: var(--color-on-surface); font-size: 15px;" id="preview-title">
                    ${draft.title || 'Untitled Brief'}
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div>
                    <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px;">Client</span>
                    <div style="font-weight: 600; color: var(--color-on-surface);" id="preview-client">${draft.client || 'Client'}</div>
                  </div>
                  <div>
                    <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px;">Format</span>
                    <div style="font-weight: 600; color: var(--color-on-surface);" id="preview-format">${draft.contentType}</div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div>
                    <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px;">Budget Tier</span>
                    <div style="font-weight: 600; color: var(--color-primary);" id="preview-budget">${draft.budgetTier?.split(' ')[0] || '$3,000 – $6,000'}</div>
                  </div>
                  <div>
                    <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px;">Target Deadline</span>
                    <div style="font-weight: 600; color: var(--color-on-surface);" id="preview-deadline">${draft.deadline || 'In 2 Weeks'}</div>
                  </div>
                </div>

                <div>
                  <span class="font-label-tag" style="color: var(--color-outline); font-size: 10px; margin-bottom: 4px; display: block;">Active Aesthetics</span>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;" id="preview-styles">
                    ${(draft.styles || []).map(s => `<span class="badge badge-neutral" style="font-size: 10.5px;">${s}</span>`).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Estimated Creator Matches Helper -->
            <div class="card" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--color-secondary); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
                <span class="material-symbols-outlined" style="font-size: 18px;">auto_awesome</span>
                <span>Explainable Matches</span>
              </div>

              <div>
                <div style="display: flex; align-items: baseline; gap: 0.5rem;">
                  <span class="font-headline-md" style="color: var(--color-primary); font-weight: 700;" id="preview-matches-count">6</span>
                  <span class="font-body-sm" style="color: var(--color-on-surface-variant); font-size: 12px;">curated creators match this scope</span>
                </div>
              </div>

              <div style="border-top: 1px solid var(--color-surface-container); padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;" id="preview-creators-list">
                <!-- Dynamically populated top matches -->
              </div>
            </div>
          </aside>
        </form>
      </section>
    </div>
  `;
}

export function initPostBriefLogic() {
  const form = document.getElementById('post-brief-form');
  const titleInput = document.getElementById('brief-title-input');
  const clientInput = document.getElementById('brief-client-input');
  const objectiveSelect = document.getElementById('brief-objective-select');
  const contentTypeSelect = document.getElementById('brief-content-type-select');
  const descInput = document.getElementById('brief-description-input');
  const deadlineInput = document.getElementById('brief-deadline-input');
  const budgetSelect = document.getElementById('brief-budget-select');
  const saveDraftBtn = document.getElementById('save-draft-btn');
  const addRefLinkBtn = document.getElementById('add-ref-link-btn');
  const refLinkInput = document.getElementById('brief-ref-link-input');
  const refLinksList = document.getElementById('ref-links-list');

  // Preview elements
  const prevTitle = document.getElementById('preview-title');
  const prevClient = document.getElementById('preview-client');
  const prevFormat = document.getElementById('preview-format');
  const prevBudget = document.getElementById('preview-budget');
  const prevDeadline = document.getElementById('preview-deadline');
  const prevStyles = document.getElementById('preview-styles');
  const prevMatchesCount = document.getElementById('preview-matches-count');
  const prevCreatorsList = document.getElementById('preview-creators-list');
  const draftStatus = document.getElementById('draft-status-text');

  let referenceLinks = ['https://vimeo.com/channels/cinematography-luxury'];

  function getFormData() {
    const selectedStyles = Array.from(document.querySelectorAll('input[name="style_choice"]:checked')).map(cb => cb.value);
    const selectedAspectRatios = Array.from(document.querySelectorAll('input[name="ar_choice"]:checked')).map(cb => cb.value);
    const selectedDeliverables = Array.from(document.querySelectorAll('input[name="deliverable_choice"]:checked')).map(cb => cb.value);
    const commercialChoice = document.querySelector('input[name="commercial_choice"]:checked')?.value || 'Full Commercial Rights';

    return {
      title: titleInput?.value.trim() || '',
      client: clientInput?.value.trim() || '',
      objective: objectiveSelect?.value || 'Brand Awareness',
      contentType: contentTypeSelect?.value || 'AI Commercial / Video Spot',
      description: descInput?.value.trim() || '',
      styles: selectedStyles,
      aspectRatios: selectedAspectRatios,
      deliverables: selectedDeliverables,
      deadline: deadlineInput?.value || '',
      budgetTier: budgetSelect?.value || '$3,000 – $6,000 USD',
      commercialUse: commercialChoice,
      referenceLinks
    };
  }

  function updatePreviewAndDraft() {
    const data = getFormData();

    // Autosave
    store.saveDraftBrief(data);
    if (draftStatus) draftStatus.textContent = 'Draft autosaved locally';

    // Update Live Summary
    if (prevTitle) prevTitle.textContent = data.title || 'Untitled Project';
    if (prevClient) prevClient.textContent = data.client || 'Studio Client';
    if (prevFormat) prevFormat.textContent = data.contentType;
    if (prevBudget) prevBudget.textContent = data.budgetTier.split(' ')[0];
    if (prevDeadline) prevDeadline.textContent = data.deadline ? new Date(data.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Flexible';
    if (prevStyles) {
      prevStyles.innerHTML = data.styles.map(s => `<span class="badge badge-neutral" style="font-size: 10.5px;">${s}</span>`).join('') || '<span style="color: var(--color-outline); font-size: 11px;">None selected</span>';
    }

    // Calculate Top Matching Creators
    const tempBrief = {
      styles: data.styles,
      contentType: data.contentType,
      requiredTools: ["Runway Gen-3", "ComfyUI"],
      aspectRatios: data.aspectRatios
    };
    const recommendations = store.getRecommendedCreatorsForBrief(tempBrief, 3);
    if (prevMatchesCount) prevMatchesCount.textContent = `${store.getCreators().length}`;

    if (prevCreatorsList) {
      prevCreatorsList.innerHTML = `
        <div class="font-label-tag" style="color: var(--color-outline); font-size: 10px;">Top Recommended Creators:</div>
        ${recommendations.map(r => `
          <div style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem; background: var(--color-surface-container-low); border-radius: var(--radius-sm);">
            <img src="${r.creator.avatar}" alt="${r.creator.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 12.5px; font-weight: 600; color: var(--color-on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${r.creator.name}
              </div>
              <div style="font-size: 11px; color: var(--color-secondary); font-weight: 500;">
                ${r.match.score}% Match • ${r.creator.discipline}
              </div>
            </div>
          </div>
        `).join('')}
      `;
    }
  }

  // Interactive Style Card Clicks
  document.querySelectorAll('.style-choice-item').forEach(item => {
    item.onclick = (e) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const card = item.querySelector('.card');
      const checkmark = item.querySelector('.checkmark-icon');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        if (checkbox.checked) {
          card.style.borderColor = 'var(--color-secondary-gold)';
          card.style.background = 'rgba(255, 221, 183, 0.3)';
          if (checkmark) checkmark.style.display = 'inline-block';
        } else {
          card.style.borderColor = 'transparent';
          card.style.background = 'var(--color-surface-container-low)';
          if (checkmark) checkmark.style.display = 'none';
        }
        updatePreviewAndDraft();
      }
    };
  });

  // Aspect Ratio Chips
  document.querySelectorAll('.ar-choice-item').forEach(item => {
    item.onclick = (e) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const badge = item.querySelector('.badge');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        if (checkbox.checked) {
          badge.className = 'badge badge-primary';
        } else {
          badge.className = 'badge badge-neutral';
        }
        updatePreviewAndDraft();
      }
    };
  });

  // Inputs live updates
  [titleInput, clientInput, descInput, deadlineInput].forEach(inp => {
    if (inp) inp.oninput = updatePreviewAndDraft;
  });
  [objectiveSelect, contentTypeSelect, budgetSelect].forEach(sel => {
    if (sel) sel.onchange = updatePreviewAndDraft;
  });

  // Deliverables Checkboxes
  document.querySelectorAll('input[name="deliverable_choice"]').forEach(cb => {
    cb.onchange = updatePreviewAndDraft;
  });

  // Commercial radio buttons
  document.querySelectorAll('input[name="commercial_choice"]').forEach(rb => {
    rb.onchange = () => {
      document.querySelectorAll('#commercial-use-group .card').forEach(c => {
        c.style.background = 'var(--color-surface-container-low)';
        c.style.borderColor = 'transparent';
      });
      const parentCard = rb.closest('.card');
      if (parentCard) {
        parentCard.style.background = 'rgba(255, 221, 183, 0.3)';
        parentCard.style.borderColor = 'var(--color-secondary-gold)';
      }
      updatePreviewAndDraft();
    };
  });

  // Reference Links
  function renderLinks() {
    if (!refLinksList) return;
    refLinksList.innerHTML = referenceLinks.map((link, idx) => `
      <span class="badge badge-outline" style="font-size: 11px; padding: 4px 8px; text-transform: none; display: inline-flex; align-items: center; gap: 4px;">
        <span class="material-symbols-outlined" style="font-size: 14px;">link</span>
        <span style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${link}</span>
        <button type="button" class="remove-link-btn" data-idx="${idx}" style="background: none; border: none; cursor: pointer; color: var(--color-outline); padding: 0; display: flex;">
          <span class="material-symbols-outlined" style="font-size: 13px;">close</span>
        </button>
      </span>
    `).join('');

    refLinksList.querySelectorAll('.remove-link-btn').forEach(b => {
      b.onclick = () => {
        const i = parseInt(b.dataset.idx);
        referenceLinks.splice(i, 1);
        renderLinks();
        updatePreviewAndDraft();
      };
    });
  }

  if (addRefLinkBtn && refLinkInput) {
    addRefLinkBtn.onclick = () => {
      const val = refLinkInput.value.trim();
      if (val) {
        referenceLinks.push(val);
        refLinkInput.value = '';
        renderLinks();
        updatePreviewAndDraft();
        showToast('Reference link added', 'add_link');
      }
    };
  }
  renderLinks();

  // Save Draft Button
  if (saveDraftBtn) {
    saveDraftBtn.onclick = () => {
      const data = getFormData();
      store.saveDraftBrief(data);
      showToast('Draft autosaved to your workspace', 'save');
    };
  }

  // Submit / Publish Brief
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const data = getFormData();
      if (!data.title) {
        showToast('Please specify a project title', 'error');
        titleInput.focus();
        return;
      }

      const createdBrief = store.publishBrief(data);

      openModal({
        title: "Creative Brief Published",
        subtitle: `Project #${createdBrief.code} is now live on the ATELIER creative network.`,
        contentHtml: `
          <div style="display: flex; flex-direction: column; gap: 1.5rem; text-align: center; padding: 1rem 0;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(192, 237, 212, 0.6); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
              <span class="material-symbols-outlined" style="font-size: 32px;">check_circle</span>
            </div>
            <div>
              <h3 class="font-headline-sm" style="color: var(--color-primary); margin-bottom: 0.5rem;">${createdBrief.title}</h3>
              <p class="font-body-sm" style="color: var(--color-on-surface-variant); max-width: 440px; margin: 0 auto; line-height: 1.5;">
                Matching creators on your roster have been invited to review the scope and submit director treatments.
              </p>
            </div>
            <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 0.5rem;">
              <button class="btn btn-outline" onclick="window.location.hash = '#dashboard'; document.getElementById('active-modal-backdrop')?.remove();">
                View Studio Dashboard
              </button>
              <button class="btn btn-primary" onclick="window.location.hash = '#brief/${createdBrief.id}'; document.getElementById('active-modal-backdrop')?.remove();">
                Inspect Brief & Matches
              </button>
            </div>
          </div>
        `
      });
    };
  }

  // Initial calculation
  updatePreviewAndDraft();
}
