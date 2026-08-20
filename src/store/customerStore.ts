import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer } from '@/types';
import { dataProvider } from '@/api/dataProvider';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCustomers: (params?: { branchId?: string; search?: string }) => Promise<void>;
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => Promise<void>;
  createCustomer: (data: Omit<Customer, 'id'>) => Promise<Customer>;
  getCustomerById: (id: string) => Customer | undefined;
  searchCustomers: (query: string, branchId?: string) => Customer[];
  getCustomersByBranch: (branchId: string) => Customer[];
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],
      isLoading: false,
      error: null,

      fetchCustomers: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const data = await dataProvider.customers.getAll(params);
          set({ customers: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

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

      deleteCustomer: async (id) => {
        set({ isLoading: true });
        try {
          await dataProvider.customers.delete(id);
          set((state) => ({
            customers: state.customers.filter((c) => c.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createCustomer: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newCustomer = await dataProvider.customers.create(data);
          set((state) => ({
            customers: [...state.customers, newCustomer],
            isLoading: false,
          }));
          return newCustomer;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
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
