import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
          // Simulate API call - in production, this would be a real API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Demo users for testing
          const demoUsers: Record<string, { user: User; branch: Branch | null }> = {
            'admin@binmishal.com': {
              user: {
                id: '1',
                email: 'admin@binmishal.com',
                name: 'মালিক',
                nameAr: 'المالك',
                phone: '+966500000000',
                role: 'super_admin',
                permissions: [{ resource: '*', actions: ['create', 'read', 'update', 'delete'] }],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              branch: null,
            },
            'mecca1@binmishal.com': {
              user: {
                id: '2',
                email: 'mecca1@binmishal.com',
                name: 'মক্কা-১ ম্যানেজার',
                nameAr: 'مدير مكة 1',
                phone: '+966500000001',
                role: 'branch_manager',
                branchId: 'MCK-1',
                branchName: 'মক্কা-১',
                permissions: [
                  { resource: 'services', actions: ['create', 'read', 'update'] },
                  { resource: 'customers', actions: ['create', 'read', 'update'] },
                  { resource: 'reports', actions: ['read'] },
                ],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              branch: {
                id: 'MCK-1',
                code: 'MCK-1',
                name: 'মক্কা-১',
                nameAr: 'مكة 1',
                city: 'মক্কা',
                country: 'SA',
                address: 'আজিজিয়া, মক্কা',
                phone: '+966500000001',
                email: 'mecca1@binmishal.com',
                isActive: true,
                isHeadOffice: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
            'jeddah1@binmishal.com': {
              user: {
                id: '3',
                email: 'jeddah1@binmishal.com',
                name: 'জেদ্দা-১ স্টাফ',
                nameAr: 'موظف جدة 1',
                phone: '+966500000002',
                role: 'branch_staff',
                branchId: 'JED-1',
                branchName: 'জেদ্দা-১',
                permissions: [
                  { resource: 'services', actions: ['create', 'read'] },
                  { resource: 'customers', actions: ['create', 'read'] },
                ],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              branch: {
                id: 'JED-1',
                code: 'JED-1',
                name: 'জেদ্দা-১',
                nameAr: 'جدة 1',
                city: 'জেদ্দা',
                country: 'SA',
                address: 'জেদ্দা, সৌদি আরব',
                phone: '+966500000002',
                email: 'jeddah1@binmishal.com',
                isActive: true,
                isHeadOffice: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          };

          const found = demoUsers[credentials.email];
          
          if (found && credentials.password === 'demo123') {
            set({
              user: found.user,
              currentBranch: found.branch,
              token: `demo-token-${Date.now()}`,
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
        } catch {
          set({
            isLoading: false,
            error: 'loginFailed',
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
