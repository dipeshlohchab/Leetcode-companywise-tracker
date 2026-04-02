'use client';
import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem('dsa_token', token);
    localStorage.setItem('dsa_user', JSON.stringify(user));
    set({ user, token, isLoading: false });
  },

  setUser: (user) => {
    localStorage.setItem('dsa_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('dsa_token');
    localStorage.removeItem('dsa_user');
    set({ user: null, token: null, isLoading: false });
  },

  initialize: () => {
    try {
      const token = localStorage.getItem('dsa_token');
      const userStr = localStorage.getItem('dsa_user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
