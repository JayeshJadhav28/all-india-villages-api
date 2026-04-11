import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  businessName?: string;
  role: string;
  status: string;
  planType?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token });
      },
      
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null });
      },
      
      get isAuthenticated() {
        return !!get().token;
      },
      
      get isAdmin() {
        return get().user?.role === 'ADMIN';
      },
      
      get isClient() {
        return get().user?.role === 'CLIENT';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);