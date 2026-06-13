import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

client.interceptors.request.use((config) => {
  // Try JWT from Zustand-persisted localStorage key first
  try {
    const stored = localStorage.getItem('fl-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
        return config;
      }
    }
  } catch (_) {}

  const token = localStorage.getItem('fl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fl-auth');
      localStorage.removeItem('fl_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
