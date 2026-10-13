// Atelier API Client — connects frontend to FastAPI backend
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8000';

const TOKEN_KEY = 'atelier_token';
const USER_KEY = 'atelier_user';

// ─── Token Management ─────────────────────────────────────────────────────────
export const auth = {
  getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  setToken(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  },
  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  },
  getUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },
  setUser(user) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
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

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: body || undefined,
  });

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
    const data = await apiFetch('/auth/register', {
      method: 'POST', body: { email, password, full_name, role }
    });
    auth.setToken(data.access_token);
    auth.setUser({ id: data.user_id, role: data.role, full_name: data.full_name });
    return data;
  },

  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST', body: { email, password }
    });
    auth.setToken(data.access_token);
    auth.setUser({ id: data.user_id, role: data.role, full_name: data.full_name });
    return data;
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
  uploadCover(file) {
    const form = new FormData();
    form.append('file', file);
    return apiFetch('/profiles/creator/me/cover', { method: 'POST', body: form });
  },
};

// ─── Portfolio ────────────────────────────────────────────────────────────────
export const portfolioApi = {
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
