import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer } from '@/types';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  
  // Actions
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (query: string, branchId?: string) => Customer[];
  getCustomersByBranch: (branchId: string) => Customer[];
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],
      isLoading: false,

      setCustomers: (customers) => set({ customers }),

      addCustomer: (customer) => {
        set((state) => ({
          customers: [...state.customers, customer],
        }));
      },

      updateCustomer: (id, data) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },

      getCustomerById: (id) => {
        return get().customers.find((c) => c.id === id);
      },

      searchCustomers: (query, branchId) => {
        const lowerQuery = query.toLowerCase();
        return get().customers.filter((c) => {
          const matchesQuery =
            c.name.toLowerCase().includes(lowerQuery) ||
            c.phone.includes(query) ||
            c.passportNumber?.toLowerCase().includes(lowerQuery) ||
            c.iqamaNumber?.includes(query);
          
          const matchesBranch = !branchId || c.branchId === branchId;
          
          return matchesQuery && matchesBranch;
        });
      },

      getCustomersByBranch: (branchId) => {
        return get().customers.filter((c) => c.branchId === branchId);
      },
    }),
    {
      name: 'customer-storage',
    }
  )
);
