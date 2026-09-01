import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdminUser } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AdminUser) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'rajnish-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
