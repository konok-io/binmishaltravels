import apiClient, { ApiResponse } from './client';
import type { Service } from '@/types';

export interface CreateServiceDto {
  name: string;
  code: string;
  category: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export const serviceApi = {
  getAll: async (params?: { category?: string; isActive?: string }): Promise<ApiResponse<Service[]>> => {
    return apiClient.get<Service[]>('/services', params as Record<string, string>);
  },

  getById: async (id: string): Promise<ApiResponse<Service>> => {
    return apiClient.get<Service>(`/services/${id}`);
  },

  create: async (data: CreateServiceDto): Promise<ApiResponse<Service>> => {
    return apiClient.post<Service>('/services', data);
  },

  update: async (id: string, data: UpdateServiceDto): Promise<ApiResponse<Service>> => {
    return apiClient.patch<Service>(`/services/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(`/services/${id}`);
  },

  getByCategory: async (category: string): Promise<ApiResponse<Service[]>> => {
    return apiClient.get<Service[]>('/services', { category });
  },
};
