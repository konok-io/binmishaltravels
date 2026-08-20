// Branch Types
export interface Branch {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  city?: string;
  country?: 'SA' | 'BD';
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isHeadOffice: boolean;
  status?: 'active' | 'inactive';
  managerName?: string;
  managerPhone?: string;
  createdAt: string;
  updatedAt?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  nameAr?: string;
  phone?: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'branch_manager' | 'branch_staff';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Service Types
export type ServiceCategory = 
  | 'air_ticket'
  | 'cargo'
  | 'iqama'
  | 'visa'
  | 'passport'
  | 'jawazat'
  | 'airport_print'
  | 'umrah';

export interface Service {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  nameAr: string;
  category: ServiceCategory;
  icon: string;
  description?: string;
  isActive: boolean;
}

export interface ServiceTransaction {
  id: string;
  branchId: string;
  branchName: string;
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerPassport?: string;
  
  details: ServiceDetails;
  
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'paid' | 'partial' | 'due';
  
  staffId: string;
  staffName: string;
  
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  
  offlineId?: string;
  isSynced: boolean;
}

export interface ServiceDetails {
  // For Air Ticket
  route?: string;
  airline?: string;
  flightDate?: string;
  returnDate?: string;
  ticketNumber?: string;
  passengerName?: string;
  passengerType?: 'adult' | 'child' | 'infant';
  pnr?: string;
  seatClass?: 'economy' | 'business' | 'first';
  
  // For Cargo
  weight?: number;
  cargoType?: string;
  origin?: string;
  destination?: string;
  trackingNumber?: string;
  
  // For Visa
  visaType?: string;
  visaDuration?: string;
  entryDate?: string;
  exitDate?: string;
  visaNumber?: string;
  
  // For Iqama
  iqamaNumber?: string;
  profession?: string;
  sponsorName?: string;
  expiryDate?: string;
  renewalStatus?: string;
  
  // For Jawazat
  jawazatType?: string;
  printCount?: number;
  
  // For Umrah
  umrahPackage?: string;
  visaValidity?: string;
  hotelName?: string;
  
  // Common fields
  notes?: string;
  referenceNumber?: string;
}

// Customer Types
export interface Customer {
  id: string;
  branchId: string;
  branchName: string;
  
  name: string;
  nameAr?: string;
  phone: string;
  email?: string;
  address?: string;
  nationality?: string;
  
  passportNumber?: string;
  passportExpiry?: string;
  
  iqamaNumber?: string;
  iqamaExpiry?: string;
  profession?: string;
  
  totalTransactions: number;
  totalSpent: number;
  lastVisit?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Report Types
export interface Report {
  id: string;
  type: ReportType;
  branchId?: string;
  dateRange: {
    from: string;
    to: string;
  };
  
  totalTransactions: number;
  totalRevenue: number;
  totalProfit: number;
  
  serviceBreakdown: ServiceBreakdown[];
  branchBreakdown?: BranchBreakdown[];
  
  generatedAt: string;
}

export type ReportType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom'
  | 'branch_summary'
  | 'consolidated';

export interface ServiceBreakdown {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
}

export interface BranchBreakdown {
  branchId: string;
  branchName: string;
  branchCode: string;
  count: number;
  revenue: number;
}

// Dashboard Types
export interface DashboardStats {
  totalTransactions: number;
  totalRevenue: number;
  todayTransactions: number;
  todayRevenue: number;
  pendingServices: number;
  completedServices: number;
  newCustomers: number;
  dueAmount: number;
}

export interface RecentTransaction {
  id: string;
  serviceName: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Sync Types
export interface SyncData {
  lastSyncAt: string;
  pendingChanges: number;
  isOnline: boolean;
}

// App State
export interface AppState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: string;
  pendingChanges: number;
}
