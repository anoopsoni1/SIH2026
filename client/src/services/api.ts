import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://sih2026-hwpz.onrender.com/api' : '/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const res: any = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          if (res.data?.success) {
            const { accessToken, refreshToken: newRefresh } = res.data.data;
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
              useAuthStore.getState().setAuth(currentUser, accessToken, newRefresh);
            }
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return axios(error.config);
          }
        } catch (refreshErr) {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);
