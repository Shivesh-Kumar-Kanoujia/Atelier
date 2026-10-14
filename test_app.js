// Automated test suite for Atelier Marketplace
import { store } from './src/data/store.js';
import { renderExploreCreatorsView } from './src/views/ExploreCreatorsView.js';
import { renderCreatorProfileView } from './src/views/CreatorProfileView.js';
import { renderPostBriefView } from './src/views/PostBriefView.js';
import { renderCompanyDashboardView } from './src/views/CompanyDashboardView.js';
import { renderBriefDetailView } from './src/views/BriefDetailView.js';
import { renderAuthView } from './src/views/AuthView.js';
import { renderCreatorDashboardView } from './src/views/CreatorDashboardView.js';
import { renderOnboardingView } from './src/views/OnboardingView.js';
import { renderHeader, getAuthenticatedUserAvatar, getUserInitials } from './src/components/Header.js';
import { renderFooter } from './src/components/Footer.js';
import { auth } from './src/api.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("=== Testing Atelier Marketplace Architecture ===");

// 1. Data Store Tests
const creators = store.getCreators();
assert(creators.length === 6, `Loaded ${creators.length} creators (expected 6)`);

const elena = store.getCreator('elena-vance');
assert(elena && elena.name === 'Elena Vance', 'Elena Vance profile is accessible');
assert(elena.portfolio.length === 4, `Elena has ${elena.portfolio.length} portfolio items`);
assert(elena.packages.length === 3, `Elena has ${elena.packages.length} commission packages`);

const briefs = store.getBriefs();
assert(briefs.length >= 4, `Loaded ${briefs.length} briefs (expected at least 4)`);

const solaar = store.getBrief('brief-solaar-ev');
assert(solaar && solaar.title.includes('Solaar EV'), 'Solaar EV brief is accessible');

// 2. Explainable Matching Tests
const elenaMatch = store.calculateMatch(elena, solaar);
assert(elenaMatch.score >= 95, `Elena Vance match score is ${elenaMatch.score}% (expected >= 95%)`);
assert(elenaMatch.breakdown.length === 4, `Match has ${elenaMatch.breakdown.length} explainability breakdown factors`);
assert(elenaMatch.breakdown[0].text.includes('Runway Gen-3'), `Breakdown specifies matching tools: ${elenaMatch.breakdown[0].text}`);

// 3. Shortlist / Bookmarks Tests
const initialSaved = store.isBookmarked('elena-vance');
store.toggleBookmark('elena-vance');
assert(store.isBookmarked('elena-vance') !== initialSaved, 'Bookmark toggle works reactively');
store.toggleBookmark('elena-vance'); // reset back

// 4. View Rendering Tests (Screen 1 to Screen 5)
try {
  const exploreHtml = renderExploreCreatorsView();
  assert(exploreHtml.includes('Explore AI Creators') && exploreHtml.includes('Elena Vance'), 'Screen 1 (Explore Creators) renders successfully');
  assert(!exploreHtml.includes('Where AI Creativity Meets Brands'), 'Tagline eyebrow is removed from Explore Creators view');
} catch (e) {
  assert(false, `Screen 1 failed to render: ${e.message}`);
}

try {
  const profileHtml = renderCreatorProfileView('elena-vance');
  assert(profileHtml.includes('Elena Vance') && profileHtml.includes('Aura Borealis') && profileHtml.includes('Julien Mercier'), 'Screen 2 (Creator Profile) renders successfully');
} catch (e) {
  assert(false, `Screen 2 failed to render: ${e.message}`);
}

try {
  const postBriefHtml = renderPostBriefView();
  assert(postBriefHtml.includes('Post a Creative Brief') && postBriefHtml.includes('Visual Style & References'), 'Screen 3 (Post a Brief) renders successfully');
} catch (e) {
  assert(false, `Screen 3 failed to render: ${e.message}`);
}

try {
  const dashboardHtml = renderCompanyDashboardView();
  assert(dashboardHtml.includes('Company Dashboard') && dashboardHtml.includes('Active Creative Briefs') && dashboardHtml.includes('Shortlisted Talent'), 'Screen 4 (Company Dashboard) renders successfully');
} catch (e) {
  assert(false, `Screen 4 failed to render: ${e.message}`);
}

try {
  const briefDetailHtml = renderBriefDetailView('brief-solaar-ev');
  assert(briefDetailHtml.includes('Solaar EV') && briefDetailHtml.includes('Recommended Creators') && briefDetailHtml.includes('Proposals Received'), 'Screen 5 (Brief Detail with Recommendations) renders successfully');
} catch (e) {
  assert(false, `Screen 5 failed to render: ${e.message}`);
}

try {
  const headerHtml = renderHeader('explore');
  const footerHtml = renderFooter();
  assert(headerHtml.includes('ATELIER') && !headerHtml.includes('Where AI Creativity Meets Brands'), 'Header includes Atelier brand and tagline is completely removed');
  assert(footerHtml.includes('WHERE AI CREATIVITY MEETS BRANDS') && footerHtml.includes('KAMPUS.VC'), 'Footer includes tagline and Kampus.VC problem statement attribution');
} catch (e) {
  assert(false, `Header/Footer failed to render: ${e.message}`);
}

// 5. Header Profile Picture, Fallback Initials & Accessibility Tests
try {
  // Test A: Authenticated Creator with avatar
  auth.setUser({
    id: 'elena-vance',
    role: 'creator',
    full_name: 'Elena Vance',
    avatar_url: 'https://images.example/elena.jpg'
  });
  const creatorHeader = renderHeader('explore');
  assert(creatorHeader.includes('header-avatar') && creatorHeader.includes('https://images.example/elena.jpg'), 'Header displays authenticated creator profile picture');
  assert(creatorHeader.includes('title="Elena Vance"') && creatorHeader.includes('aria-label="Profile of Elena Vance"'), 'Header provides accessible tooltip and label with user name');
  assert(creatorHeader.includes('badge-primary') && creatorHeader.includes('Creator'), 'Header preserves Creator role badge');
  assert(creatorHeader.includes('header-logout-btn') && !creatorHeader.includes('>Elena Vance<'), 'Header preserves logout button and replaces visible text name with avatar');

  // Test B: Authenticated Brand / Org with logo
  auth.setUser({
    id: 'brand-123',
    role: 'brand',
    full_name: 'Amay Sharma',
    logo_url: 'https://images.example/brand-logo.png'
  });
  const brandHeader = renderHeader('dashboard');
  assert(brandHeader.includes('header-avatar') && brandHeader.includes('https://images.example/brand-logo.png'), 'Header displays authenticated brand profile picture / logo');
  assert(brandHeader.includes('badge-secondary') && brandHeader.includes('Brand / Org'), 'Header preserves Brand / Org role badge');
  assert(brandHeader.includes('title="Amay Sharma"'), 'Header provides accessible label for brand user');

  // Test C: Authenticated User with NO profile picture (fallback initials)
  auth.setUser({
    id: 'new-user',
    role: 'brand',
    full_name: 'Amay Sharma'
  });
  const fallbackHeader = renderHeader('explore');
  assert(fallbackHeader.includes('header-avatar-fallback') && fallbackHeader.includes('<span>AS</span>'), 'Header displays polished fallback avatar with initials (AS) when no image exists');
  assert(getUserInitials({ full_name: 'Amay Sharma' }) === 'AS', 'Initials helper computes AS correctly for Amay Sharma');
  assert(getUserInitials({ full_name: 'Elena Vance' }) === 'EV', 'Initials helper computes EV correctly for Elena Vance');

  // Clear auth session back to clean state
  auth.clearToken();
  const guestHeader = renderHeader('explore');
  assert(guestHeader.includes('Sign In') && guestHeader.includes('Join Atelier'), 'Header renders guest auth CTA when not logged in');
} catch (e) {
  assert(false, `Top navigation avatar tests failed: ${e.message}`);
}

// 6. Auth, Onboarding & Creator Studio View Tests
try {
  const loginHtml = renderAuthView('login');
  const registerHtml = renderAuthView('register');
  assert(loginHtml.includes('Sign in') && registerHtml.includes('Create Account') && registerHtml.includes('Creator') && registerHtml.includes('Brand / Org'), 'AuthView renders login and registration with both roles');
} catch (e) {
  assert(false, `AuthView failed to render: ${e.message}`);
}

try {
  const creatorDashHtml = renderCreatorDashboardView();
  assert(creatorDashHtml.includes('Creator Studio') && creatorDashHtml.includes('Invitations') && creatorDashHtml.includes('Engagements'), 'CreatorDashboardView renders studio panels');
} catch (e) {
  assert(false, `CreatorDashboardView failed to render: ${e.message}`);
}

try {
  const creatorOnbHtml = renderOnboardingView('creator');
  const brandOnbHtml = renderOnboardingView('brand');
  assert(creatorOnbHtml.includes('Complete Your Creator Dossier') && creatorOnbHtml.includes('Primary AI Tools'), 'Creator Onboarding renders correctly');
  assert(brandOnbHtml.includes('Set Up Your Brand Profile') && brandOnbHtml.includes('Organization / Brand Name'), 'Brand Onboarding renders correctly');
} catch (e) {
  assert(false, `OnboardingView failed to render: ${e.message}`);
}

// 7. Brief Publication & Proposal Acceptance
const newBrief = store.publishBrief({
  title: 'Automated Test Brand Campaign',
  client: 'Test Brand Co',
  budgetTier: '$6,000 – $12,000 USD',
  contentType: 'AI Commercial / Video Spot',
  styles: ['Cinematic 35mm']
});
assert(newBrief && store.getBrief(newBrief.id), 'Dynamic brief publication persists in store');

const accepted = store.acceptProposal('prop-1');
assert(accepted, 'Proposal acceptance executes cleanly');
const updatedSolaar = store.getBrief('brief-solaar-ev');
assert(updatedSolaar.status === 'in_production', 'Brief status updated to in_production upon accepting proposal');

// 8. Creator Profile Media & Portfolio Item Store Management
const initialElenaAvatar = store.getCreator('elena-vance').avatar;
store.updateCreator('elena-vance', { avatar: 'https://test.atelier/avatar-custom.jpg' });
assert(store.getCreator('elena-vance').avatar === 'https://test.atelier/avatar-custom.jpg', 'Creator avatar updates reactively in store');
// restore initial avatar
store.updateCreator('elena-vance', { avatar: initialElenaAvatar });

const testItem = {
  id: 'work-test-' + Date.now(),
  title: 'Cybernetic Flora Spot',
  category: 'AI Commercial',
  image: 'https://test.atelier/cybernetic-flora.jpg'
};
store.addPortfolioItem('elena-vance', testItem);
assert(store.getCreator('elena-vance').portfolio.some(p => p.id === testItem.id), 'New portfolio item found in creator portfolio');

store.removePortfolioItem('elena-vance', testItem.id);
assert(!store.getCreator('elena-vance').portfolio.some(p => p.id === testItem.id), 'Removed portfolio item no longer in creator portfolio');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
