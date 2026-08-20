import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Online/Offline status
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  
  // Sync status
  isSyncing: boolean;
  lastSyncAt: string | null;
  pendingChanges: number;
  setSyncing: (syncing: boolean) => void;
  setLastSync: (time: string) => void;
  setPendingChanges: (count: number) => void;
  
  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Online/Offline
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      setOnline: (online) => set({ isOnline: online }),
      
      // Sync
      isSyncing: false,
      lastSyncAt: null,
      pendingChanges: 0,
      setSyncing: (syncing) => set({ isSyncing: syncing }),
      setLastSync: (time) => set({ lastSyncAt: time }),
      setPendingChanges: (count) => set({ pendingChanges: count }),
      
      // UI
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      
      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification = { ...notification, id };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));
        
        // Auto remove after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }));
          }, notification.duration || 5000);
        }
      },
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
      }),
    }
  )
);

// Setup online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOnline(true);
  });
  
  window.addEventListener('offline', () => {
    useAppStore.getState().setOnline(false);
  });
}
