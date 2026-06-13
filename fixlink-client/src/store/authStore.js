import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        localStorage.removeItem('fl_token');
        set({ token: null, user: null });
      },
    }),
    {
      name: 'fl-auth',
      getStorage: () => localStorage,
    }
  )
);
