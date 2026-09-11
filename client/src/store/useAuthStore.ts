import { create } from 'zustand';
import { UserRole } from '@shared';

export interface UserState {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  language: 'en' | 'hi';
}

interface AuthStore {
  user: UserState | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: UserState, accessToken: string, refreshToken: string) => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem('coop_user') || 'null'),
  accessToken: localStorage.getItem('coop_access_token') || null,
  refreshToken: localStorage.getItem('coop_refresh_token') || null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('coop_user', JSON.stringify(user));
    localStorage.setItem('coop_access_token', accessToken);
    localStorage.setItem('coop_refresh_token', refreshToken);
    set({ user, accessToken, refreshToken });
  },

  setLanguage: (lang) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, language: lang };
      localStorage.setItem('coop_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  logout: () => {
    localStorage.removeItem('coop_user');
    localStorage.removeItem('coop_access_token');
    localStorage.removeItem('coop_refresh_token');
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
