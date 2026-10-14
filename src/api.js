// Atelier API Client — connects frontend to FastAPI backend
const DEFAULT_API_BASE = (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:8000'
  : 'http://localhost:8000';
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || DEFAULT_API_BASE;

const TOKEN_KEY = 'atelier_token';
const USER_KEY = 'atelier_user';

const memoryStorage = new Map();

function getItem(key) {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
  } catch {}
  return memoryStorage.get(key) || null;
}

function setItem(key, val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
      return;
    }
  } catch {}
  memoryStorage.set(key, String(val));
}

function removeItem(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {}
  memoryStorage.delete(key);
}

// ─── Token Management ─────────────────────────────────────────────────────────
export const auth = {
  getToken() {
    return getItem(TOKEN_KEY);
  },
  setToken(token) {
    setItem(TOKEN_KEY, token);
  },
  clearToken() {
    removeItem(TOKEN_KEY);
    removeItem(USER_KEY);
  },
  getUser() {
    const u = getItem(USER_KEY);
    try {
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },
  setUser(user) {
    setItem(USER_KEY, JSON.stringify(user));
  },
  isLoggedIn() { return !!this.getToken(); },
};

// ─── Core Fetch ───────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }
  if (body instanceof FormData) {
    delete headers['Content-Type']; // Let browser set multipart boundary
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: options.method || 'GET',
      headers,
      body: body || undefined,
    });
  } catch (netErr) {
    // If connection failed (e.g. localhost vs 127.0.0.1 resolution mismatch), try the alternate host
    const alternateBase = API_BASE.includes('localhost')
      ? API_BASE.replace('localhost', '127.0.0.1')
      : API_BASE.replace('127.0.0.1', 'localhost');
    try {
      res = await fetch(`${alternateBase}${path}`, {
        method: options.method || 'GET',
        headers,
        body: body || undefined,
      });
    } catch {
      throw netErr;
    }
  }

  if (res.status === 401) {
    if (path !== '/auth/login' && path !== '/auth/register') {
      auth.clearToken();
      window.location.hash = '#login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || JSON.stringify(err);
    } catch {}
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  async register(email, password, full_name, role) {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST', body: { email, password, full_name, role }
      });
      auth.setToken(data.access_token);
      auth.setUser({ id: data.user_id, role: data.role, full_name: data.full_name });
      return data;
    } catch (err) {
      if (err.message && (err.message.includes('already exists') || err.message.includes('registered') || err.message.includes('HTTP 400'))) {
        throw err;
      }
      if (err.message && (err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed'))) {
        console.warn("Backend API unavailable, creating local session:", err);
        const mockUserId = `user-${Date.now()}`;
        const mockToken = `local-token-${Date.now()}`;
        auth.setToken(mockToken);
        auth.setUser({ id: mockUserId, role, full_name });
        return { access_token: mockToken, user_id: mockUserId, role, full_name };
      }
      throw err;
    }
  },

  async login(email, password) {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST', body: { email, password }
      });
      auth.setToken(data.access_token);
      let avatarUrl = null;
      try {
        if (data.role === 'creator') {
          const prof = await profileApi.getMyCreatorProfile();
          if (prof?.avatar_url) avatarUrl = prof.avatar_url;
        } else if (data.role === 'brand') {
          const prof = await profileApi.getMyBrandProfile();
          if (prof?.logo_url) {
            avatarUrl = prof.logo_url;
            try { localStorage.setItem('atelier_brand_logo_v1', prof.logo_url); } catch {}
          }
        }
      } catch {}
      auth.setUser({ 
        id: data.user_id, 
        role: data.role, 
        full_name: data.full_name,
        avatar_url: avatarUrl 
      });
      return data;
    } catch (err) {
      if (err.message && (err.message.includes('Invalid') || err.message.includes('HTTP 401') || err.message.includes('Unauthorized') || err.message.includes('not found'))) {
        throw err;
      }
      if (err.message && (err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed'))) {
        console.warn("Backend API unavailable, authenticating locally:", err);
        const emailLower = email.toLowerCase();
        const isBrand = emailLower.includes('brand') || emailLower.includes('aura') || emailLower.includes('studio') || emailLower.includes('org');
        const role = isBrand ? 'brand' : 'creator';
        const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
        const full_name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const mockUserId = isBrand ? 'brand-user' : 'elena-vance';
        const mockToken = `local-token-${Date.now()}`;
        auth.setToken(mockToken);
        auth.setUser({ id: mockUserId, role, full_name });
        return { access_token: mockToken, user_id: mockUserId, role, full_name };
      }
      throw err;
    }
  },

  async logout() {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    auth.clearToken();
  },

  async me() {
    return apiFetch('/auth/me');
  },
};

// ─── Creator Profiles ─────────────────────────────────────────────────────────
export const profileApi = {
  getMyCreatorProfile: () => apiFetch('/profiles/creator/me'),
  createCreatorProfile: (data) => apiFetch('/profiles/creator', { method: 'POST', body: data }),
  updateCreatorProfile: (data) => apiFetch('/profiles/creator/me', { method: 'PATCH', body: data }),
  getCreatorProfile: (id) => apiFetch(`/profiles/creator/${id}`),
  getMyBrandProfile: () => apiFetch('/profiles/brand/me'),
  createBrandProfile: (data) => apiFetch('/profiles/brand', { method: 'POST', body: data }),
  updateBrandProfile: (data) => apiFetch('/profiles/brand/me', { method: 'PATCH', body: data }),

  uploadAvatar(file) {
    const form = new FormData();
    form.append('file', file);
    return apiFetch('/profiles/creator/me/avatar', { method: 'POST', body: form });
  },
  deleteAvatar() {
    return apiFetch('/profiles/creator/me/avatar', { method: 'DELETE' });
  },
  uploadCover(file) {
    const form = new FormData();
    form.append('file', file);
    return apiFetch('/profiles/creator/me/cover', { method: 'POST', body: form });
  },
  uploadBrandLogo(file) {
    const form = new FormData();
    form.append('file', file);
    return apiFetch('/profiles/brand/me/logo', { method: 'POST', body: form });
  },
  deleteBrandLogo() {
    return apiFetch('/profiles/brand/me/logo', { method: 'DELETE' });
  },
};

// ─── Portfolio ────────────────────────────────────────────────────────────────
export const portfolioApi = {
  mine: () => apiFetch('/portfolio/mine'),
  list: (creatorId) => apiFetch(`/portfolio/${creatorId}`),
  create: (data) => apiFetch('/portfolio', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/portfolio/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiFetch(`/portfolio/${id}`, { method: 'DELETE' }),
  uploadMedia(itemId, file) {
    const form = new FormData();
    form.append('file', file);
    return apiFetch(`/portfolio/${itemId}/media`, { method: 'POST', body: form });
  },
};

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const campaignApi = {
  list: (params = {}) => apiFetch('/campaigns?' + new URLSearchParams(params)),
  mine: () => apiFetch('/campaigns/mine'),
  get: (id) => apiFetch(`/campaigns/${id}`),
  getFull: (id) => apiFetch(`/campaigns/${id}/full`),
  create: (data) => apiFetch('/campaigns', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/campaigns/${id}`, { method: 'PATCH', body: data }),
  publish: (id) => apiFetch(`/campaigns/${id}/publish`, { method: 'POST' }),
  close: (id) => apiFetch(`/campaigns/${id}/close`, { method: 'POST' }),
};

// ─── Discovery ────────────────────────────────────────────────────────────────
export const discoverApi = {
  search: (params = {}) => apiFetch('/discover?' + new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== ''))
  )),
};

// ─── Shortlists ───────────────────────────────────────────────────────────────
export const shortlistApi = {
  get: () => apiFetch('/shortlists'),
  toggle: (creatorId) => apiFetch(`/shortlists/${creatorId}/toggle`, { method: 'POST' }),
};

// ─── Invitations ─────────────────────────────────────────────────────────────
export const invitationApi = {
  send: (data) => apiFetch('/invitations', { method: 'POST', body: data }),
  mine: () => apiFetch('/invitations/mine'),
  respond: (id, status) => apiFetch(`/invitations/${id}/respond`, { method: 'PATCH', body: { status } }),
};

// ─── Engagements ──────────────────────────────────────────────────────────────
export const engagementApi = {
  mine: () => apiFetch('/engagements/mine'),
  complete: (id) => apiFetch(`/engagements/${id}/complete`, { method: 'PATCH' }),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiApi = {
  generateBrief: (data) => apiFetch('/ai/generate-brief', { method: 'POST', body: data }),
};
