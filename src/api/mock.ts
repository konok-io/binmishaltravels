// Mock API implementation for demo purposes
import type { ServiceCategory } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

let transactions: any[] = [];
let customers: any[] = [];
let services: any[] = [];
let branches: any[] = [];

const initializeDemoData = () => {
  if (branches.length === 0) {
    branches = [
      { id: 'branch-1', code: 'RYD-001', name: 'Riyadh Main', city: 'Riyadh', country: 'SA', address: 'Riyadh, Saudi Arabia', phone: '+966 XX XXX XXXX', email: 'riyadh@binmishal.com', isActive: true, isHeadOffice: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'branch-2', code: 'JED-001', name: 'Jeddah Office', city: 'Jeddah', country: 'SA', address: 'Jeddah, Saudi Arabia', phone: '+966 XX XXX XXXX', email: 'jeddah@binmishal.com', isActive: true, isHeadOffice: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'branch-3', code: 'MCK-001', name: 'Makkah Branch', city: 'Makkah', country: 'SA', address: 'Makkah, Saudi Arabia', phone: '+966 XX XXX XXXX', email: 'makkah@binmishal.com', isActive: true, isHeadOffice: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
  }

  if (services.length === 0) {
    services = [
      { id: 'service-1', code: 'umrah', name: 'Umrah Package', category: 'umrah' as ServiceCategory, icon: '🕋', description: 'Complete Umrah package', isActive: true },
      { id: 'service-2', code: 'visa', name: 'Visa Processing', category: 'visa' as ServiceCategory, icon: '📋', description: 'Saudi Arabia visa processing', isActive: true },
      { id: 'service-3', code: 'ticket', name: 'Ticket Booking', category: 'air_ticket' as ServiceCategory, icon: '✈️', description: 'Flight ticket booking', isActive: true },
      { id: 'service-4', code: 'hotel', name: 'Hotel Booking', category: 'umrah' as ServiceCategory, icon: '🏨', description: 'Hotel reservation', isActive: true },
      { id: 'service-5', code: 'transport', name: 'Transport Service', category: 'cargo' as ServiceCategory, icon: '🚗', description: 'Airport/hotel transport', isActive: true },
    ];
  }

  if (customers.length === 0) {
    customers = [
      { id: 'cust-1', name: 'Ahmed Hassan', phone: '+966 XX XXX XXXX', email: 'ahmed@example.com', nationality: 'Saudi Arabia', branchId: 'branch-1', branchName: 'Riyadh Main', totalTransactions: 5, totalSpent: 12500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'cust-2', name: 'Mohammad Ali', phone: '+966 XX XXX XXXX', email: 'mohammad@example.com', nationality: 'Pakistan', branchId: 'branch-1', branchName: 'Riyadh Main', totalTransactions: 3, totalSpent: 3500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'cust-3', name: 'Karim Benzema', phone: '+966 XX XXX XXXX', email: 'karim@example.com', nationality: 'France', branchId: 'branch-2', branchName: 'Jeddah Office', totalTransactions: 2, totalSpent: 1600, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
  }

  if (transactions.length === 0) {
    transactions = [
      { id: 'txn-1', serviceId: 'service-1', serviceName: 'Umrah Package', serviceCode: 'umrah', customerId: 'cust-1', customerName: 'Ahmed Hassan', customerPhone: '+966 XX XXX XXXX', amount: 2500, paidAmount: 2500, dueAmount: 0, status: 'completed', paymentStatus: 'paid', details: {}, staffId: 'staff-1', staffName: 'Admin', branchId: 'branch-1', branchName: 'Riyadh Main', isSynced: true, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'txn-2', serviceId: 'service-2', serviceName: 'Visa Processing', serviceCode: 'visa', customerId: 'cust-2', customerName: 'Mohammad Ali', customerPhone: '+966 XX XXX XXXX', amount: 500, paidAmount: 250, dueAmount: 250, status: 'processing', paymentStatus: 'partial', details: {}, staffId: 'staff-1', staffName: 'Admin', branchId: 'branch-1', branchName: 'Riyadh Main', isSynced: true, createdAt: new Date(Date.now() - 43200000).toISOString(), updatedAt: new Date(Date.now() - 43200000).toISOString() },
      { id: 'txn-3', serviceId: 'service-3', serviceName: 'Ticket Booking', serviceCode: 'ticket', customerId: 'cust-3', customerName: 'Karim Benzema', customerPhone: '+966 XX XXX XXXX', amount: 800, paidAmount: 800, dueAmount: 0, status: 'completed', paymentStatus: 'paid', details: {}, staffId: 'staff-1', staffName: 'Admin', branchId: 'branch-2', branchName: 'Jeddah Office', isSynced: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
  }
};

initializeDemoData();

export const mockApi = {
  transactions: {
    getAll: async (params?: { branchId?: string }): Promise<ApiResponse<any[]>> => {
      await delay(300);
      let result = [...transactions];
      if (params?.branchId) result = result.filter(t => t.branchId === params.branchId);
      return { data: result, success: true };
    },
    getById: async (id: string): Promise<ApiResponse<any>> => {
      await delay(200);
      const txn = transactions.find(t => t.id === id);
      if (!txn) throw { message: 'Transaction not found', status: 404 };
      return { data: txn, success: true };
    },
    create: async (data: any): Promise<ApiResponse<any>> => {
      await delay(300);
      const newTxn = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      transactions.unshift(newTxn);
      return { data: newTxn, success: true };
    },
    update: async (id: string, data: any): Promise<ApiResponse<any>> => {
      await delay(300);
      const index = transactions.findIndex(t => t.id === id);
      if (index === -1) throw { message: 'Transaction not found', status: 404 };
      transactions[index] = { ...transactions[index], ...data, updatedAt: new Date().toISOString() };
      return { data: transactions[index], success: true };
    },
    delete: async (id: string): Promise<ApiResponse<null>> => {
      await delay(300);
      const index = transactions.findIndex(t => t.id === id);
      if (index === -1) throw { message: 'Transaction not found', status: 404 };
      transactions.splice(index, 1);
      return { data: null, success: true };
    },
  },
  customers: {
    getAll: async (params?: { branchId?: string; search?: string }): Promise<ApiResponse<any[]>> => {
      await delay(300);
      let result = [...customers];
      if (params?.branchId) result = result.filter(c => c.branchId === params.branchId);
      if (params?.search) {
        const search = params.search.toLowerCase();
        result = result.filter(c => c.name.toLowerCase().includes(search) || c.email?.toLowerCase().includes(search));
      }
      return { data: result, success: true };
    },
    getById: async (id: string): Promise<ApiResponse<any>> => {
      await delay(200);
      const customer = customers.find(c => c.id === id);
      if (!customer) throw { message: 'Customer not found', status: 404 };
      return { data: customer, success: true };
    },
    create: async (data: any): Promise<ApiResponse<any>> => {
      await delay(300);
      const newCustomer = { ...data, id: generateId(), totalTransactions: 0, totalSpent: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      customers.push(newCustomer);
      return { data: newCustomer, success: true };
    },
    update: async (id: string, data: any): Promise<ApiResponse<any>> => {
      await delay(300);
      const index = customers.findIndex(c => c.id === id);
      if (index === -1) throw { message: 'Customer not found', status: 404 };
      customers[index] = { ...customers[index], ...data, updatedAt: new Date().toISOString() };
      return { data: customers[index], success: true };
    },
    delete: async (id: string): Promise<ApiResponse<null>> => {
      await delay(300);
      const index = customers.findIndex(c => c.id === id);
      if (index === -1) throw { message: 'Customer not found', status: 404 };
      customers.splice(index, 1);
      return { data: null, success: true };
    },
  },
  services: {
    getAll: async (): Promise<ApiResponse<any[]>> => {
      await delay(200);
      return { data: services, success: true };
    },
    getById: async (id: string): Promise<ApiResponse<any>> => {
      await delay(200);
      const service = services.find(s => s.id === id);
      if (!service) throw { message: 'Service not found', status: 404 };
      return { data: service, success: true };
    },
    create: async (data: any): Promise<ApiResponse<any>> => {
      await delay(300);
      const newService = { ...data, id: generateId() };
      services.push(newService);
      return { data: newService, success: true };
    },
    update: async (id: string, data: any): Promise<ApiResponse<any>> => {
      await delay(300);
      const index = services.findIndex(s => s.id === id);
      if (index === -1) throw { message: 'Service not found', status: 404 };
      services[index] = { ...services[index], ...data };
      return { data: services[index], success: true };
    },
    delete: async (id: string): Promise<ApiResponse<null>> => {
      await delay(300);
      const index = services.findIndex(s => s.id === id);
      if (index === -1) throw { message: 'Service not found', status: 404 };
      services.splice(index, 1);
      return { data: null, success: true };
    },
  },
  branches: {
    getAll: async (): Promise<ApiResponse<any[]>> => {
      await delay(200);
      return { data: branches, success: true };
    },
    getById: async (id: string): Promise<ApiResponse<any>> => {
      await delay(200);
      const branch = branches.find(b => b.id === id);
      if (!branch) throw { message: 'Branch not found', status: 404 };
      return { data: branch, success: true };
    },
    create: async (data: any): Promise<ApiResponse<any>> => {
      await delay(300);
      const newBranch = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      branches.push(newBranch);
      return { data: newBranch, success: true };
    },
    update: async (id: string, data: any): Promise<ApiResponse<any>> => {
      await delay(300);
      const index = branches.findIndex(b => b.id === id);
      if (index === -1) throw { message: 'Branch not found', status: 404 };
      branches[index] = { ...branches[index], ...data, updatedAt: new Date().toISOString() };
      return { data: branches[index], success: true };
    },
    delete: async (id: string): Promise<ApiResponse<null>> => {
      await delay(300);
      const index = branches.findIndex(b => b.id === id);
      if (index === -1) throw { message: 'Branch not found', status: 404 };
      branches.splice(index, 1);
      return { data: null, success: true };
    },
  },
};

export default mockApi;
