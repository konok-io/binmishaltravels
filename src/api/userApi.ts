import apiClient, { ApiResponse } from './client';
import type { User, UserRole } from '@/types';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  nameAr?: string;
  phone?: string;
  role: UserRole;
  branchId?: string;
}

export interface UpdateUserDto {
  name?: string;
  nameAr?: string;
  phone?: string;
  role?: UserRole;
  branchId?: string;
}

export const userApi = {
  getAll: async (params?: { branchId?: string }): Promise<ApiResponse<User[]>> => {
    return apiClient.get<User[]>('/users', params);
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  create: async (data: CreateUserDto): Promise<ApiResponse<User>> => {
    return apiClient.post<User>('/users', data);
  },

  update: async (id: string, data: UpdateUserDto): Promise<ApiResponse<User>> => {
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<null>(`/users/${id}`);
  },

  toggleStatus: async (id: string): Promise<ApiResponse<User>> => {
    return apiClient.patch<User>(`/users/${id}/toggle-status`, {});
  },
};
