import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Service, ServiceCategory } from '@/types';

interface ServiceState {
  services: Service[];
  isLoading: boolean;
  
  // Actions
  setServices: (services: Service[]) => void;
  addService: (service: Service) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  getServiceById: (id: string) => Service | undefined;
  getServiceByCode: (code: ServiceCategory) => Service | undefined;
  getServicesByCategory: (category: ServiceCategory) => Service[];
}

const initialServices: Service[] = [
  // Air Ticket Services
  {
    id: '1',
    code: 'air_ticket',
    name: 'Air Ticket',
    nameBn: 'বিমান টিকিট',
    nameAr: 'تذكرة طيران',
    category: 'air_ticket',
    icon: '✈️',
    description: 'Book flight tickets for various routes',
    isActive: true,
  },
  {
    id: '2',
    code: 'ticket_booking',
    name: 'Ticket Booking',
    nameBn: 'টিকিট বুকিং',
    nameAr: 'حجز التذكرة',
    category: 'air_ticket',
    icon: '📋',
    description: 'New flight ticket booking service',
    isActive: true,
  },
  {
    id: '3',
    code: 'ticket_cancellation',
    name: 'Ticket Cancellation',
    nameBn: 'টিকিট বাতিল',
    nameAr: 'إلغاء التذكرة',
    category: 'air_ticket',
    icon: '❌',
    description: 'Cancel existing flight tickets',
    isActive: true,
  },
  {
    id: '4',
    code: 'refund',
    name: 'Refund Processing',
    nameBn: 'রিফান্ড',
    nameAr: 'استرداد',
    category: 'air_ticket',
    icon: '💰',
    description: 'Process ticket refunds',
    isActive: true,
  },
  {
    id: '5',
    code: 'travel_insurance',
    name: 'Travel Insurance',
    nameBn: 'ট্রাভেল ইন্স্যুরেন্স',
    nameAr: 'تأمين السفر',
    category: 'air_ticket',
    icon: '🛡️',
    description: 'Travel insurance services',
    isActive: true,
  },
  
  // Cargo Services
  {
    id: '6',
    code: 'cargo',
    name: 'Cargo Service',
    nameBn: 'কার্গো সার্ভিস',
    nameAr: 'خدمة الشحن',
    category: 'cargo',
    icon: '📦',
    description: 'Cargo and luggage services',
    isActive: true,
  },
  {
    id: '7',
    code: 'luggage_23kg',
    name: '23KG Luggage',
    nameBn: '২৩ কেজি লাগেজ',
    nameAr: '23 كجم أمتعة',
    category: 'cargo',
    icon: '🧳',
    description: '23KG luggage service',
    isActive: true,
  },
  {
    id: '8',
    code: 'air_cargo',
    name: 'Air Cargo',
    nameBn: 'এয়ার কার্গো',
    nameAr: 'شحن جوي',
    category: 'cargo',
    icon: '✈️',
    description: 'Air cargo services',
    isActive: true,
  },
  
  // Iqama Services
  {
    id: '9',
    code: 'iqama',
    name: 'Iqama Service',
    nameBn: 'ইকামা সেবা',
    nameAr: 'خدمة الإقامة',
    category: 'iqama',
    icon: '🪪',
    description: 'Iqama related services',
    isActive: true,
  },
  {
    id: '10',
    code: 'iqama_online',
    name: 'Iqama Online',
    nameBn: 'ইকামা অনলাইন',
    nameAr: 'الإقامة أونلاين',
    category: 'iqama',
    icon: '💻',
    description: 'Online iqama services',
    isActive: true,
  },
  {
    id: '11',
    code: 'iqama_medical',
    name: 'Iqama Medical',
    nameBn: 'ইকামা মেডিকেল',
    nameAr: 'الفحص الطبي للإقامة',
    category: 'iqama',
    icon: '🏥',
    description: 'Medical test for iqama',
    isActive: true,
  },
  {
    id: '12',
    code: 'iqama_insurance',
    name: 'Iqama Insurance',
    nameBn: 'ইকামা ইন্স্যুরেন্স',
    nameAr: 'تأمين الإقامة',
    category: 'iqama',
    icon: '📄',
    description: 'Iqama insurance services',
    isActive: true,
  },
  {
    id: '13',
    code: 'iqama_exit_check',
    name: 'Iqama/Exit Check',
    nameBn: 'ইকামা/এক্সিট চেক',
    nameAr: 'فحص الإقامة/الخروج',
    category: 'iqama',
    icon: '✅',
    description: 'Check iqama and exit status',
    isActive: true,
  },
  
  // Visa Services
  {
    id: '14',
    code: 'visa',
    name: 'Visa Service',
    nameBn: 'ভিসা সেবা',
    nameAr: 'خدمة التأشيرة',
    category: 'visa',
    icon: '📋',
    description: 'Visa processing services',
    isActive: true,
  },
  {
    id: '15',
    code: 'new_visit_visa',
    name: 'New Visit Visa',
    nameBn: 'নতুন জিয়ারা ভিসা',
    nameAr: 'تأشيرة زيارة جديدة',
    category: 'visa',
    icon: '🆕',
    description: 'New visit visa application',
    isActive: true,
  },
  {
    id: '16',
    code: 'visa_renewal',
    name: 'Visa Renewal',
    nameBn: 'ভিসা রিনিউ',
    nameAr: 'تجديد التأشيرة',
    category: 'visa',
    icon: '🔄',
    description: 'Renew existing visa',
    isActive: true,
  },
  
  // Passport Services
  {
    id: '17',
    code: 'passport',
    name: 'Passport Service',
    nameBn: 'পাসপোর্ট সেবা',
    nameAr: 'خدمة جواز السفر',
    category: 'passport',
    icon: '📘',
    description: 'Passport information and services',
    isActive: true,
  },
  
  // Jawazat Services
  {
    id: '18',
    code: 'jawazat',
    name: 'Jawazat Service',
    nameBn: 'জাওয়াজাত সেবা',
    nameAr: 'خدمة الأحوال',
    category: 'jawazat',
    icon: '🏛️',
    description: 'Jawazat services',
    isActive: true,
  },
  {
    id: '19',
    code: 'jawazat_print',
    name: 'Jawazat Print',
    nameBn: 'জাওয়াজাত প্রিন্ট',
    nameAr: 'طباعة الأحوال',
    category: 'jawazat',
    icon: '🖨️',
    description: 'Print jawazat documents',
    isActive: true,
  },
  
  // Airport Services
  {
    id: '20',
    code: 'airport_print',
    name: 'Airport Print',
    nameBn: 'এয়ারপোর্ট প্রিন্ট',
    nameAr: 'طباعة المطار',
    category: 'airport_print',
    icon: '🖨️',
    description: 'Airport document printing',
    isActive: true,
  },
  
  // Umrah Services
  {
    id: '21',
    code: 'umrah',
    name: 'Umrah Service',
    nameBn: 'উমরাহ সেবা',
    nameAr: 'خدمة العمرة',
    category: 'umrah',
    icon: '🕋',
    description: 'Umrah travel services',
    isActive: true,
  },
  {
    id: '22',
    code: 'umrah_package',
    name: 'Umrah Package',
    nameBn: 'উমরাহ প্যাকেজ',
    nameAr: 'باقة العمرة',
    category: 'umrah',
    icon: '📦',
    description: 'Umrah travel packages',
    isActive: true,
  },
  {
    id: '23',
    code: 'roqsa_amal',
    name: 'Roqsa Amal',
    nameBn: 'রোকসা আমেল',
    nameAr: 'رقصة عامل',
    category: 'umrah',
    icon: '📝',
    description: 'Exit/re-entry permit',
    isActive: true,
  },
];

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      services: initialServices,
      isLoading: false,

      setServices: (services) => set({ services }),

      addService: (service) => {
        set((state) => ({
          services: [...state.services, service],
        }));
      },

      updateService: (id, data) => {
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        }));
      },

      deleteService: (id) => {
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        }));
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
    }),
    {
      name: 'service-storage',
    }
  )
);
