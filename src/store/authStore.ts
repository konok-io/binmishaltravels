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

// Local storage helpers for persistent login
const STORAGE_KEY = 'binmishal_auth';

const saveToStorage = (data: { user: User | null; token: string | null }) => {
  try {
    console.log('💾 saveToStorage:', data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('💾 Saved to localStorage');
  } catch (e) {
    console.error('💾 saveToStorage - error:', e);
  }
};

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // ignore
  }
  return { user: null, token: null };
};

const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
};

// Load initial state from localStorage
const initialState = loadFromStorage();

export const useAuthStore = create<AuthState>()((set) => ({
  user: initialState.user,
  currentBranch: null,
  token: initialState.token,
  isAuthenticated: !!initialState.token && !!initialState.user,
  isLoading: false,
  error: null,

  setAuth: (user, branch, token) => {
    saveToStorage({ user, token });
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
        console.log('🔑 Login response:', response);
        console.log('🔑 Login response.data:', response.data);
        // Server returns: { success: true, data: { user, token } }
        // apiClient wraps as: { data: { success: true, data: { user, token } }, success: true }
        // So response.data.data = { user, token }
        const loginData = (response.data as any).data;
        const { user, token } = loginData;
        console.log('🔑 User:', user, 'Token:', token);
        saveToStorage({ user, token });
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
    clearStorage();
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
    const stored = loadFromStorage();
    if (stored.token && stored.user) {
      set({ 
        token: stored.token, 
        user: stored.user,
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
