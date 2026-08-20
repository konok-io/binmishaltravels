import apiClient, { ApiResponse } from './client';
import type { Customer } from '@/types';

export interface CreateCustomerDto {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  passport?: string;
  iqama?: string;
  nationality?: string;
  notes?: string;
  branchId: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export const customerApi = {
  getAll: async (params?: { branchId?: string; search?: string }): Promise<ApiResponse<Customer[]>> => {
    return apiClient.get<Customer[]>('/customers', params);
  },

  getById: async (id: string): Promise<ApiResponse<Customer>> => {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  create: async (data: CreateCustomerDto): Promise<ApiResponse<Customer>> => {
    return apiClient.post<Customer>('/customers', data);
  },

  update: async (id: string, data: UpdateCustomerDto): Promise<ApiResponse<Customer>> => {
    return apiClient.patch<Customer>(`/customers/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(`/customers/${id}`);
  },

  search: async (query: string): Promise<ApiResponse<Customer[]>> => {
    return apiClient.get<Customer[]>('/customers/search', { q: query });
  },
};
