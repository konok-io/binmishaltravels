import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch } from '@/types';
import { dataProvider } from '@/api/dataProvider';

interface BranchState {
  branches: Branch[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBranches: () => Promise<void>;
  setBranches: (branches: Branch[]) => void;
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, data: Partial<Branch>) => void;
  deleteBranch: (id: string) => Promise<void>;
  getBranchById: (id: string) => Branch | undefined;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      branches: [],
      isLoading: false,
      error: null,

      fetchBranches: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await dataProvider.branches.getAll();
          set({ branches: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      setBranches: (branches) => set({ branches }),

      addBranch: (branch) => {
        set((state) => ({
          branches: [...state.branches, branch],
        }));
      },

      updateBranch: (id, data) => {
        set((state) => ({
          branches: state.branches.map((b) =>
            b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      deleteBranch: async (id) => {
        set({ isLoading: true });
        try {
          await dataProvider.branches.delete(id);
          set((state) => ({
            branches: state.branches.filter((b) => b.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      getBranchById: (id) => {
        return get().branches.find((b) => b.id === id);
      },
    }),
    {
      name: 'branch-storage',
    }
  )
);
