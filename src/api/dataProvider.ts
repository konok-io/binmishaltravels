// Data provider that uses either mock or real API based on environment
import { USE_MOCK_API, mockApi, transactionApi, customerApi, serviceApi, branchApi, userApi } from './index';
import type { ServiceTransaction, Customer, Service, Branch, User } from '@/types';

// Helper to extract data from nested API response
const extractData = <T>(response: any, isList: boolean = false): T => {
  // Server returns: { success: true, data: [...] }
  // apiClient wraps as: { data: { success: true, data: [...] }, success: true }
  // So response.data.data = the actual data
  if (isList) {
    return response.data?.data || [];
  }
  return response.data?.data || response.data;
};

export const dataProvider = {
  transactions: {
    async getAll(params?: { branchId?: string }): Promise<ServiceTransaction[]> {
      if (USE_MOCK_API) {
        const response = await mockApi.transactions.getAll(params);
        return response.data;
      }
      const response = await transactionApi.getAll(params);
      return extractData<ServiceTransaction[]>(response, true);
    },

    async getById(id: string): Promise<ServiceTransaction> {
      if (USE_MOCK_API) {
        const response = await mockApi.transactions.getById(id);
        return response.data;
      }
      const response = await transactionApi.getById(id);
      return extractData<ServiceTransaction>(response);
    },

    async create(data: any): Promise<ServiceTransaction> {
      if (USE_MOCK_API) {
        const response = await mockApi.transactions.create(data);
        return response.data;
      }
      const response = await transactionApi.create(data);
      return extractData<ServiceTransaction>(response);
    },

    async update(id: string, data: any): Promise<ServiceTransaction> {
      if (USE_MOCK_API) {
        const response = await mockApi.transactions.update(id, data);
        return response.data;
      }
      const response = await transactionApi.update(id, data);
      return extractData<ServiceTransaction>(response);
    },

    async delete(id: string): Promise<void> {
      if (USE_MOCK_API) {
        await mockApi.transactions.delete(id);
        return;
      }
      await transactionApi.delete(id);
    },
  },

  customers: {
    async getAll(params?: { branchId?: string; search?: string }): Promise<Customer[]> {
      if (USE_MOCK_API) {
        const response = await mockApi.customers.getAll(params);
        return response.data;
      }
      const response = await customerApi.getAll(params);
      return extractData<Customer[]>(response, true);
    },

    async getById(id: string): Promise<Customer> {
      if (USE_MOCK_API) {
        const response = await mockApi.customers.getById(id);
        return response.data;
      }
      const response = await customerApi.getById(id);
      return extractData<Customer>(response);
    },

    async create(data: any): Promise<Customer> {
      if (USE_MOCK_API) {
        const response = await mockApi.customers.create(data);
        return response.data;
      }
      const response = await customerApi.create(data);
      return extractData<Customer>(response);
    },

    async update(id: string, data: any): Promise<Customer> {
      if (USE_MOCK_API) {
        const response = await mockApi.customers.update(id, data);
        return response.data;
      }
      const response = await customerApi.update(id, data);
      return extractData<Customer>(response);
    },

    async delete(id: string): Promise<void> {
      if (USE_MOCK_API) {
        await mockApi.customers.delete(id);
        return;
      }
      await customerApi.delete(id);
    },
  },

  services: {
    async getAll(): Promise<Service[]> {
      if (USE_MOCK_API) {
        const response = await mockApi.services.getAll();
        return response.data;
      }
      const response = await serviceApi.getAll();
      return extractData<Service[]>(response, true);
    },

    async getById(id: string): Promise<Service> {
      if (USE_MOCK_API) {
        const response = await mockApi.services.getById(id);
        return response.data;
      }
      const response = await serviceApi.getById(id);
      return extractData<Service>(response);
    },

    async create(data: any): Promise<Service> {
      if (USE_MOCK_API) {
        const response = await mockApi.services.create(data);
        return response.data;
      }
      const response = await serviceApi.create(data);
      return extractData<Service>(response);
    },

    async update(id: string, data: any): Promise<Service> {
      if (USE_MOCK_API) {
        const response = await mockApi.services.update(id, data);
        return response.data;
      }
      const response = await serviceApi.update(id, data);
      return extractData<Service>(response);
    },

    async delete(id: string): Promise<void> {
      if (USE_MOCK_API) {
        await mockApi.services.delete(id);
        return;
      }
      await serviceApi.delete(id);
    },
  },

  branches: {
    async getAll(): Promise<Branch[]> {
      if (USE_MOCK_API) {
        const response = await mockApi.branches.getAll();
        return response.data;
      }
      const response = await branchApi.getAll();
      return extractData<Branch[]>(response, true);
    },

    async getById(id: string): Promise<Branch> {
      if (USE_MOCK_API) {
        const response = await mockApi.branches.getById(id);
        return response.data;
      }
      const response = await branchApi.getById(id);
      return extractData<Branch>(response);
    },

    async create(data: any): Promise<Branch> {
      if (USE_MOCK_API) {
        const response = await mockApi.branches.create(data);
        return response.data;
      }
      const response = await branchApi.create(data);
      return extractData<Branch>(response);
    },

    async update(id: string, data: any): Promise<Branch> {
      if (USE_MOCK_API) {
        const response = await mockApi.branches.update(id, data);
        return response.data;
      }
      const response = await branchApi.update(id, data);
      return extractData<Branch>(response);
    },

    async delete(id: string): Promise<void> {
      if (USE_MOCK_API) {
        await mockApi.branches.delete(id);
        return;
      }
      await branchApi.delete(id);
    },
  },

  users: {
    async getAll(params?: { branchId?: string }): Promise<User[]> {
      const response = await userApi.getAll(params);
      return extractData<User[]>(response, true);
    },

    async getById(id: string): Promise<User> {
      const response = await userApi.getById(id);
      return extractData<User>(response);
    },

    async create(data: any): Promise<User> {
      const response = await userApi.create(data);
      return extractData<User>(response);
    },

    async update(id: string, data: any): Promise<User> {
      const response = await userApi.update(id, data);
      return extractData<User>(response);
    },

    async delete(id: string): Promise<void> {
      await userApi.delete(id);
    },

    async toggleStatus(id: string): Promise<User> {
      const response = await userApi.toggleStatus(id);
      return extractData<User>(response);
    },
  },
};

export default dataProvider;
