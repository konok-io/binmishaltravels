import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch } from '@/types';

interface BranchState {
  branches: Branch[];
  isLoading: boolean;
  
  // Actions
  setBranches: (branches: Branch[]) => void;
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, data: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  getBranchById: (id: string) => Branch | undefined;
}

// Initial branches data
const initialBranches: Branch[] = [
  // Saudi Arabia branches
  {
    id: 'MCK-1',
    code: 'MCK-1',
    name: 'মক্কা-১',
    nameAr: 'مكة 1',
    city: 'মক্কা',
    country: 'SA',
    address: 'আজিজিয়া, মক্কা',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'MCK-2',
    code: 'MCK-2',
    name: 'মক্কা-২',
    nameAr: 'مكة 2',
    city: 'মক্কা',
    country: 'SA',
    address: 'মক্কা',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'RYD-1',
    code: 'RYD-1',
    name: 'রিয়াদ-১',
    nameAr: 'الرياض 1',
    city: 'রিয়াদ',
    country: 'SA',
    address: 'রিয়াদ',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'RYD-2',
    code: 'RYD-2',
    name: 'রিয়াদ-২',
    nameAr: 'الرياض 2',
    city: 'রিয়াদ',
    country: 'SA',
    address: 'রিয়াদ',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'RYD-3',
    code: 'RYD-3',
    name: 'রিয়াদ-৩',
    nameAr: 'الرياض 3',
    city: 'রিয়াদ',
    country: 'SA',
    address: 'রিয়াদ',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'JED-1',
    code: 'JED-1',
    name: 'জেদ্দা-১',
    nameAr: 'جدة 1',
    city: 'জেদ্দা',
    country: 'SA',
    address: 'জেদ্দা',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'JED-2',
    code: 'JED-2',
    name: 'জেদ্দা-২',
    nameAr: 'جدة 2',
    city: 'জেদ্দা',
    country: 'SA',
    address: 'জেদ্দা',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'DMM',
    code: 'DMM',
    name: 'দাম্মাম',
    nameAr: 'الدمام',
    city: 'দাম্মাম',
    country: 'SA',
    address: 'দাম্মাম',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KHB',
    code: 'KHB',
    name: 'খোবার',
    nameAr: 'الخبر',
    city: 'খোবার',
    country: 'SA',
    address: 'খোবার',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'JBL',
    code: 'JBL',
    name: 'জুবাইল',
    nameAr: 'الجبيل',
    city: 'জুবাইল',
    country: 'SA',
    address: 'জুবাইল',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'MDN-1',
    code: 'MDN-1',
    name: 'মদিনা-১',
    nameAr: 'المدينة 1',
    city: 'মদিনা',
    country: 'SA',
    address: 'মদিনা',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'MDN-2',
    code: 'MDN-2',
    name: 'মদিনা-২',
    nameAr: 'المدينة 2',
    city: 'মদিনা',
    country: 'SA',
    address: 'মদিনা',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'QZN',
    code: 'QZN',
    name: 'জিজান',
    nameAr: 'القصيم',
    city: 'জিজান',
    country: 'SA',
    address: 'জিজান',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TBK',
    code: 'TBK',
    name: 'তাবুক',
    nameAr: 'تبوك',
    city: 'তাবুক',
    country: 'SA',
    address: 'তাবুক',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'KMS',
    code: 'KMS',
    name: 'খামিস মুসাইদ',
    nameAr: 'خميس مشيط',
    city: 'খামিস মুসাইদ',
    country: 'SA',
    address: 'খামিস মুসাইদ',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'HO',
    code: 'HO',
    name: 'করপোরেট অফিস',
    nameAr: 'المكتب الرئيسي',
    city: 'মক্কা',
    country: 'SA',
    address: 'সাফা টাওয়ার, ১৪তলা, আজিজিয়া, মক্কা',
    isActive: true,
    isHeadOffice: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Bangladesh branches
  {
    id: 'DHK',
    code: 'DHK',
    name: 'ঢাকা',
    nameAr: 'دكا',
    city: 'ঢাকা',
    country: 'BD',
    address: 'ঢাকা, বাংলাদেশ',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CTG',
    code: 'CTG',
    name: 'চট্টগ্রাম',
    nameAr: 'تشيتاغونغ',
    city: 'চট্টগ্রাম',
    country: 'BD',
    address: 'চট্টগ্রাম, বাংলাদেশ',
    isActive: true,
    isHeadOffice: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      branches: initialBranches,
      isLoading: false,

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

      deleteBranch: (id) => {
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        }));
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
