import { create } from 'zustand';
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

// Session storage helpers
const SESSION_KEY = 'binmishal_auth';

const saveToSession = (data: { user: User | null; token: string | null }) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    // sessionStorage not available
  }
};

const loadFromSession = () => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // ignore
  }
  return { user: null, token: null };
};

const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    // ignore
  }
};

// Load initial state from session
const initialSession = loadFromSession();

export const useAuthStore = create<AuthState>()((set) => ({
  user: initialSession.user,
  currentBranch: null,
  token: initialSession.token,
  isAuthenticated: !!initialSession.token && !!initialSession.user,
  isLoading: false,
  error: null,

  setAuth: (user, branch, token) => {
    saveToSession({ user, token });
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
        saveToSession({ user, token });
        set({
          user,
          currentBranch: null,
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
    clearSession();
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
    const session = loadFromSession();
    if (session.token && session.user) {
      set({ 
        token: session.token, 
        user: session.user,
        isAuthenticated: true, 
        isLoading: false 
      });
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
}));
