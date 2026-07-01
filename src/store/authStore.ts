import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '@/api';

const AUTH_FETCH_KEY = 'auth-last-fetch';
const AUTH_FETCH_TTL_MS = 3 * 60_000;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  fetchUser: (opts?: { force?: boolean }) => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password, rememberMe) => {
        const { data } = await authApi.login({ email, password, remember_me: rememberMe });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        const me = await authApi.me();
        sessionStorage.setItem(AUTH_FETCH_KEY, String(Date.now()));
        set({ user: me.data, isAuthenticated: true });
      },

      register: async (name, email, password, confirmPassword) => {
        const { data } = await authApi.register({
          name,
          email,
          password,
          confirm_password: confirmPassword,
        });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        const me = await authApi.me();
        sessionStorage.setItem(AUTH_FETCH_KEY, String(Date.now()));
        set({ user: me.data, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem(AUTH_FETCH_KEY);
        set({ user: null, isAuthenticated: false });
      },

      fetchUser: async (opts) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }
        const hasCachedUser = !!get().user;
        const lastFetch = Number(sessionStorage.getItem(AUTH_FETCH_KEY) || 0);
        if (!opts?.force && hasCachedUser && Date.now() - lastFetch < AUTH_FETCH_TTL_MS) {
          set({ isAuthenticated: true, isLoading: false });
          return;
        }
        if (!hasCachedUser) {
          set({ isLoading: true });
        }
        try {
          const { data } = await authApi.me();
          sessionStorage.setItem(AUTH_FETCH_KEY, String(Date.now()));
          set({ user: data, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          sessionStorage.removeItem(AUTH_FETCH_KEY);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
