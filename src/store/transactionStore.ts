import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ServiceTransaction, ServiceCategory, DashboardStats, ServiceBreakdown, BranchBreakdown } from '@/types';

interface TransactionState {
  transactions: ServiceTransaction[];
  isLoading: boolean;
  
  // Actions
  setTransactions: (transactions: ServiceTransaction[]) => void;
  addTransaction: (transaction: ServiceTransaction) => void;
  updateTransaction: (id: string, data: Partial<ServiceTransaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => ServiceTransaction | undefined;
  
  // Query methods
  getTransactionsByBranch: (branchId: string) => ServiceTransaction[];
  getTransactionsByService: (serviceCategory: ServiceCategory) => ServiceTransaction[];
  getTransactionsByDateRange: (from: string, to: string, branchId?: string) => ServiceTransaction[];
  getTodayTransactions: (branchId?: string) => ServiceTransaction[];
  
  // Dashboard stats
  getDashboardStats: (branchId?: string) => DashboardStats;
  getServiceBreakdown: (from: string, to: string, branchId?: string) => ServiceBreakdown[];
  getBranchBreakdown: (from: string, to: string) => BranchBreakdown[];
  
  // Recent transactions
  getRecentTransactions: (limit: number, branchId?: string) => ServiceTransaction[];
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,

      setTransactions: (transactions) => set({ transactions }),

      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        }));
      },

      updateTransaction: (id, data) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },

      getTransactionsByBranch: (branchId) => {
        return get().transactions.filter((t) => t.branchId === branchId);
      },

      getTransactionsByService: (serviceCategory) => {
        return get().transactions.filter((t) => t.serviceCode === serviceCategory);
      },

      getTransactionsByDateRange: (from, to, branchId) => {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        
        return get().transactions.filter((t) => {
          const date = new Date(t.createdAt);
          const inRange = date >= fromDate && date <= toDate;
          const matchesBranch = !branchId || t.branchId === branchId;
          return inRange && matchesBranch;
        });
      },

      getTodayTransactions: (branchId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return get().transactions.filter((t) => {
          const date = new Date(t.createdAt);
          const isToday = date >= today;
          const matchesBranch = !branchId || t.branchId === branchId;
          return isToday && matchesBranch;
        });
      },

      getDashboardStats: (branchId) => {
        const transactions = branchId 
          ? get().getTransactionsByBranch(branchId)
          : get().transactions;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayTxns = transactions.filter((t) => new Date(t.createdAt) >= today);
        
        const stats: DashboardStats = {
          totalTransactions: transactions.length,
          totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
          todayTransactions: todayTxns.length,
          todayRevenue: todayTxns.reduce((sum, t) => sum + t.amount, 0),
          pendingServices: transactions.filter((t) => t.status === 'pending' || t.status === 'processing').length,
          completedServices: transactions.filter((t) => t.status === 'completed').length,
          newCustomers: transactions.filter((t) => {
            const date = new Date(t.createdAt);
            return date >= today;
          }).length,
          dueAmount: transactions.reduce((sum, t) => sum + t.dueAmount, 0),
        };
        
        return stats;
      },

      getServiceBreakdown: (from, to, branchId) => {
        const transactions = get().getTransactionsByDateRange(from, to, branchId);
        
        const breakdownMap = new Map<string, ServiceBreakdown>();
        
        transactions.forEach((t) => {
          const existing = breakdownMap.get(t.serviceCode);
          if (existing) {
            existing.count += 1;
            existing.revenue += t.amount;
          } else {
            breakdownMap.set(t.serviceCode, {
              serviceId: t.serviceId,
              serviceName: t.serviceName,
              count: 1,
              revenue: t.amount,
            });
          }
        });
        
        return Array.from(breakdownMap.values());
      },

      getBranchBreakdown: (from, to) => {
        const transactions = get().getTransactionsByDateRange(from, to);
        
        const breakdownMap = new Map<string, BranchBreakdown>();
        
        transactions.forEach((t) => {
          const existing = breakdownMap.get(t.branchId);
          if (existing) {
            existing.count += 1;
            existing.revenue += t.amount;
          } else {
            breakdownMap.set(t.branchId, {
              branchId: t.branchId,
              branchName: t.branchName,
              branchCode: t.branchId,
              count: 1,
              revenue: t.amount,
            });
          }
        });
        
        return Array.from(breakdownMap.values());
      },

      getRecentTransactions: (limit, branchId) => {
        const transactions = branchId 
          ? get().getTransactionsByBranch(branchId)
          : get().transactions;
        
        return transactions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      },
    }),
    {
      name: 'transaction-storage',
    }
  )
);
