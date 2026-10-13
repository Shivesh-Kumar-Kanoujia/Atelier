// Client-side Router for Atelier
import { renderHeader, initHeaderListeners } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderExploreCreatorsView, initExploreCreatorsLogic } from './views/ExploreCreatorsView.js';
import { renderCreatorProfileView, initCreatorProfileLogic } from './views/CreatorProfileView.js';
import { renderPostBriefView, initPostBriefLogic } from './views/PostBriefView.js';
import { renderCompanyDashboardView, initCompanyDashboardLogic } from './views/CompanyDashboardView.js';
import { renderBriefDetailView, initBriefDetailLogic } from './views/BriefDetailView.js';
import { store } from './data/store.js';

export function initRouter() {
  const appContainer = document.getElementById('app');

  function resolveRoute() {
    const hash = window.location.hash.slice(1) || 'explore';
    const parts = hash.split('/');
    const route = parts[0];
    const param = parts[1];

    let viewHtml = '';
    let initLogic = () => {};

    if (route === 'explore') {
      viewHtml = renderExploreCreatorsView();
      initLogic = initExploreCreatorsLogic;
    } else if (route === 'profile') {
      viewHtml = renderCreatorProfileView(param || 'elena-vance');
      initLogic = () => initCreatorProfileLogic(param || 'elena-vance');
    } else if (route === 'post-brief') {
      viewHtml = renderPostBriefView();
      initLogic = initPostBriefLogic;
    } else if (route === 'dashboard') {
      viewHtml = renderCompanyDashboardView();
      initLogic = initCompanyDashboardLogic;
    } else if (route === 'brief') {
      viewHtml = renderBriefDetailView(param || 'brief-solaar-ev');
      initLogic = () => initBriefDetailLogic(param || 'brief-solaar-ev');
    } else {
      // Fallback
      viewHtml = renderExploreCreatorsView();
      initLogic = initExploreCreatorsLogic;
    }

    appContainer.innerHTML = `
      ${renderHeader(route)}
      <main id="main-content" style="flex: 1;">
        ${viewHtml}
      </main>
      ${renderFooter()}
    `;

    // Initialize logic
    initHeaderListeners();
    initLogic();

    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('hashchange', resolveRoute);
  
  // Also re-render header badge when store changes
  store.subscribe(() => {
    const hash = window.location.hash.slice(1) || 'explore';
    const headerElement = document.querySelector('.site-header');
    if (headerElement) {
      const headerContainer = document.createElement('div');
      headerContainer.innerHTML = renderHeader(hash.split('/')[0]);
      headerElement.replaceWith(headerContainer.firstElementChild);
      initHeaderListeners();
    }
  });

  resolveRoute();
}
