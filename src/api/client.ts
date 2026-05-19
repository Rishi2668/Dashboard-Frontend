import axios from 'axios';

/** Ensure production API base always ends with /api/v1 (common deploy mistake). */
function resolveApiUrl(): string {
  const fallback = import.meta.env.DEV ? '/api/v1' : 'http://localhost:8000/api/v1';
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || fallback;
  const base = raw.replace(/\/+$/, '');
  if (base.endsWith('/api/v1')) return base;
  if (base.includes('/api/v1/')) return base.split('/api/v1/')[0] + '/api/v1';
  return `${base}/api/v1`;
}

const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refresh,
          });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
