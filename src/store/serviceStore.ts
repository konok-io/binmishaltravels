import { create } from 'zustand';
import type { Service, ServiceCategory } from '@/types';
import { dataProvider } from '@/api/dataProvider';
import type { CreateServiceDto } from '@/api/serviceApi';

interface ServiceState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchServices: () => Promise<void>;
  setServices: (services: Service[]) => void;
  addService: (service: Service) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => Promise<void>;
  getServiceById: (id: string) => Service | undefined;
  getServiceByCode: (code: string) => Service | undefined;
  getServicesByCategory: (category: ServiceCategory) => Service[];
}

export const useServiceStore = create<ServiceState>()((set, get) => ({
  services: [],
  isLoading: false,
  error: null,

  fetchServices: async () => {
    console.log('🔵 fetchServices called');
    set({ isLoading: true, error: null });
    try {
      const data = await dataProvider.services.getAll();
      console.log('🔵 fetchServices got data:', data.length, 'services');
      set({ services: data, isLoading: false });
    } catch (error: any) {
      console.error('🔴 fetchServices error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  setServices: (services) => set({ services }),

  addService: async (service) => {
    console.log('🔵 addService called with:', service);
    
    // First add to local state immediately
    set((state) => {
      console.log('🔵 Adding to local state, current services:', state.services.length);
      return {
        services: [...state.services, service],
      };
    });
    
    try {
      // Then save to API
      const serviceDto: CreateServiceDto = {
        name: service.name,
        nameBn: service.nameBn,
        nameAr: service.nameAr,
        code: service.code,
        category: service.category,
        icon: service.icon,
        description: service.description,
        link: service.link,
        isActive: service.isActive,
      };
      
      console.log('🔵 Saving to API with DTO:', serviceDto);
      const savedService = await dataProvider.services.create(serviceDto);
      console.log('🔵 Saved service from API:', savedService);
      
      // Update with saved service (has DB ID)
      set((state) => ({
        services: state.services.map(s => 
          s.id === service.id ? savedService : s
        ),
      }));
    } catch (error: any) {
      console.error('🔴 Failed to save service to API:', error);
      set({ error: error.message });
    }
  },

  updateService: (id, data) => {
    set((state) => ({
      services: state.services.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    }));
  },

  deleteService: async (id) => {
    set({ isLoading: true });
    try {
      await dataProvider.services.delete(id);
      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getServiceById: (id) => {
    return get().services.find((s) => s.id === id);
  },

  getServiceByCode: (code) => {
    return get().services.find((s) => s.code === code);
  },

  getServicesByCategory: (category) => {
    return get().services.filter((s) => s.category === category);
  },
}));
