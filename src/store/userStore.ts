import { create } from 'zustand';
import type { User } from '@/types';
import { dataProvider } from '@/api/dataProvider';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUsers: (branchId?: string) => Promise<void>;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserState>()((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async (branchId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params: { branchId?: string } = {};
      if (branchId) {
        params.branchId = branchId;
      }
      const data = await dataProvider.users.getAll(params);
      set({ users: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setUsers: (users) => set({ users }),

  addUser: (user) => {
    set((state) => ({
      users: [...state.users, user],
    }));
  },

  updateUser: (id, data) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, ...data, updatedAt: new Date().toISOString() } : u
      ),
    }));
  },

  deleteUser: async (id) => {
    set({ isLoading: true });
    try {
      await dataProvider.users.delete(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getUserById: (id) => {
    return get().users.find((u) => u.id === id);
  },
}));
