export { apiClient } from './client';
export type { ApiResponse, ApiError } from './client';
export { transactionApi } from './transactionApi';
export type { CreateTransactionDto, UpdateTransactionDto } from './transactionApi';
export { customerApi } from './customerApi';
export type { CreateCustomerDto, UpdateCustomerDto } from './customerApi';
export { serviceApi } from './serviceApi';
export type { CreateServiceDto, UpdateServiceDto } from './serviceApi';
export { branchApi } from './branchApi';
export type { CreateBranchDto, UpdateBranchDto } from './branchApi';
export { mockApi } from './mock';

// Determine if we should use mock API
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_API_URL;
export const API_MODE = USE_MOCK_API ? 'mock' : 'real';
