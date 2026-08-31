import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const BASE_URL = import.meta.env.PROD 
  ? 'https://brass-q9gb.onrender.com/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper to prefix relative upload paths with Render backend URL in production
function prefixUploadUrls(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('/api/uploads/')) {
      return `https://brass-q9gb.onrender.com${obj}`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(prefixUploadUrls);
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      res[key] = prefixUploadUrls(obj[key]);
    }
    return res;
  }
  return obj;
}

// Refresh on 401
let isRefreshing = false;
let queue: Array<{ resolve: (t: string) => void; reject: (e: Error) => void }> = [];
const drainQueue = (err: Error | null, token: string | null) => {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)));
  queue = [];
};

api.interceptors.response.use(
  (r) => {
    if (import.meta.env.PROD && r.data) {
      r.data = prefixUploadUrls(r.data);
    }
    return r;
  },
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) return new Promise((resolve, reject) => queue.push({ resolve, reject })).then((t) => { orig.headers.Authorization = `Bearer ${t}`; return api(orig); });
      orig._retry = true; isRefreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const token = data.data.accessToken;
        useAuthStore.getState().setAccessToken(token);
        drainQueue(null, token);
        orig.headers.Authorization = `Bearer ${token}`;
        return api(orig);
      } catch (e) {
        drainQueue(e as Error, null);
        useAuthStore.getState().logout();
        return Promise.reject(e);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

// ── Products ─────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: Record<string, string>) => api.get('/products', { params }),
  getOne: (slug: string) => api.get(`/products/${slug}`),
  create: (data: unknown) => api.post('/products', data),
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  uploadImages: (id: string, files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    return api.post(`/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteImage: (productId: string, imageId: string) => api.delete(`/products/${productId}/images/${imageId}`),
};

// ── Categories ───────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getOne: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: unknown) => api.post('/categories', data),
  update: (id: string, data: unknown) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  uploadImage: (id: string, file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post(`/categories/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── Testimonials ─────────────────────────────────────────────
export const testimonialsApi = {
  getAll: () => api.get('/testimonials'),
  create: (data: unknown) => api.post('/testimonials', data),
  update: (id: string, data: unknown) => api.put(`/testimonials/${id}`, data),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
  uploadAvatar: (id: string, file: File) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post(`/testimonials/${id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── Services ─────────────────────────────────────────────────
export const servicesApi = {
  getAll: () => api.get('/services'),
  create: (data: unknown) => api.post('/services', data),
  update: (id: string, data: unknown) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// ── Settings ─────────────────────────────────────────────────
export const settingsApi = {
  getAll: () => api.get('/settings'),
  getByGroup: (group: string) => api.get(`/settings/${group}`),
  update: (data: Record<string, string>) => api.put('/settings', data),
  uploadLogo: (file: File) => {
    const fd = new FormData();
    fd.append('logo', file);
    return api.post('/settings/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── Contact ──────────────────────────────────────────────────
export const contactApi = {
  submit: (data: { name: string; email: string; phone?: string; company?: string; subject: string; message: string }) => api.post('/contact', data),
};

// ── Inquiry ──────────────────────────────────────────────────
export const inquiryApi = {
  submit: (data: { name: string; email: string; phone: string; company?: string; productId: string; quantity?: string; requirements: string }) => api.post('/inquiry', data),
};

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (credentials: { username: string; password: string }) => api.post('/auth/login', credentials),
  verifyOtp: (data: { mfaToken: string; otp: string }) => api.post('/auth/verify-otp', data),
  forgotPassword: (data: { username: string }) => api.post('/auth/forgot-password', data),
  verifyResetOtp: (data: { resetToken: string; otp: string }) => api.post('/auth/verify-reset-otp', data),
  resetPassword: (data: { resetToken: string; otp: string; newPassword: string }) => api.post('/auth/reset-password', data),
  updateAccount: (data: { username?: string; email?: string; password?: string }) => api.put('/auth/update-account', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};
