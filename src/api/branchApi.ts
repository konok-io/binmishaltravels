import apiClient, { ApiResponse } from './client';
import type { Branch } from '@/types';

export interface CreateBranchDto {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  isActive: boolean;
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {}

export const branchApi = {
  getAll: async (): Promise<ApiResponse<Branch[]>> => {
    return apiClient.get<Branch[]>('/branches');
  },

  getById: async (id: string): Promise<ApiResponse<Branch>> => {
    return apiClient.get<Branch>(`/branches/${id}`);
  },

  create: async (data: CreateBranchDto): Promise<ApiResponse<Branch>> => {
    return apiClient.post<Branch>('/branches', data);
  },

  update: async (id: string, data: UpdateBranchDto): Promise<ApiResponse<Branch>> => {
    return apiClient.patch<Branch>(`/branches/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(`/branches/${id}`);
  },
};
