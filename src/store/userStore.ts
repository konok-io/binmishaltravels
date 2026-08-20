import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface UserState {
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User, password?: string) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
}

// Mock passwords store (in a real app, this would be handled by backend)
const passwordStore: Record<string, string> = {};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: 'USR-001',
          email: 'admin@binmishal.com',
          name: 'Admin User',
          role: 'super_admin',
          permissions: [],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'USR-002',
          email: 'manager@binmishal.com',
          name: 'Branch Manager',
          role: 'branch_manager',
          branchId: 'BR-001',
          branchName: 'Head Office',
          permissions: [],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'USR-003',
          email: 'staff@binmishal.com',
          name: 'Branch Staff',
          role: 'branch_staff',
          branchId: 'BR-001',
          branchName: 'Head Office',
          permissions: [],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],

      setUsers: (users) => set({ users }),

      addUser: (user, password) => {
        if (password) {
          passwordStore[user.id] = password;
        }
        set((state) => ({
          users: [...state.users, { ...user, updatedAt: new Date().toISOString() }],
        }));
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id
              ? { ...user, ...updates, updatedAt: new Date().toISOString() }
              : user
          ),
        }));
      },

      deleteUser: (id) => {
        delete passwordStore[id];
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }));
      },

      getUserById: (id) => {
        return get().users.find((user) => user.id === id);
      },
    }),
    {
      name: 'binmishal-users',
    }
  )
);
