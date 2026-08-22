import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/api/client';
import type { User, Branch, LoginCredentials } from '@/types';

interface AuthState {
  user: User | null;
  currentBranch: Branch | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAuth: (user: User, branch: Branch | null, token: string) => void;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setCurrentBranch: (branch: Branch) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentBranch: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, branch, token) => {
        set({
          user,
          currentBranch: branch,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
          
          if (response.success) {
            const { user, token } = response.data;
            set({
              user,
              currentBranch: user.branchId as unknown as Branch || null,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: 'invalidCredentials',
            });
            return false;
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'loginFailed',
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          currentBranch: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (token) {
          set({ isLoading: false });
        } else {
          set({ isLoading: false, isAuthenticated: false });
        }
      },

      setCurrentBranch: (branch) => {
        set({ currentBranch: branch });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        currentBranch: state.currentBranch,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
