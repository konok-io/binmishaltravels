import apiClient, { ApiResponse } from './client';
import type { ServiceTransaction } from '@/types';

export interface CreateTransactionDto {
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerPassport?: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  details?: Record<string, any>;
  branchId: string;
  branchName: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

export const transactionApi = {
  getAll: async (params?: { branchId?: string; from?: string; to?: string }): Promise<ApiResponse<ServiceTransaction[]>> => {
    return apiClient.get<ServiceTransaction[]>('/transactions', params);
  },

  getById: async (id: string): Promise<ApiResponse<ServiceTransaction>> => {
    return apiClient.get<ServiceTransaction>(`/transactions/${id}`);
  },

  create: async (data: CreateTransactionDto): Promise<ApiResponse<ServiceTransaction>> => {
    return apiClient.post<ServiceTransaction>('/transactions', data);
  },

  update: async (id: string, data: UpdateTransactionDto): Promise<ApiResponse<ServiceTransaction>> => {
    return apiClient.patch<ServiceTransaction>(`/transactions/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(`/transactions/${id}`);
  },

  updatePayment: async (id: string, paidAmount: number, dueAmount: number): Promise<ApiResponse<ServiceTransaction>> => {
    return apiClient.patch<ServiceTransaction>(`/transactions/${id}/payment`, { paidAmount, dueAmount });
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<ServiceTransaction>> => {
    return apiClient.patch<ServiceTransaction>(`/transactions/${id}/status`, { status });
  },

  getStats: async (branchId?: string): Promise<ApiResponse<any>> => {
    return apiClient.get<any>('/transactions/stats', branchId ? { branchId } : undefined);
  },

  getByDateRange: async (from: string, to: string, branchId?: string): Promise<ApiResponse<ServiceTransaction[]>> => {
    const params: Record<string, string> = { from, to };
    if (branchId) params.branchId = branchId;
    return apiClient.get<ServiceTransaction[]>('/transactions/range', params);
  },
};
