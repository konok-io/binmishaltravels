import {
  getSyncQueue,
  removeFromSyncQueue,
  updateSyncQueueItem,
  setLastSyncTime,
} from './offline';

const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30 seconds

type SyncCallback = (status: SyncStatus) => void;

export interface SyncStatus {
  isOnline: boolean;
  pendingItems: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  errors: string[];
}

let syncStatus: SyncStatus = {
  isOnline: navigator.onLine,
  pendingItems: 0,
  isSyncing: false,
  lastSyncTime: null,
  errors: [],
};

let listeners: Set<SyncCallback> = new Set();
let syncIntervalId: number | null = null;

export const getSyncStatus = (): SyncStatus => ({ ...syncStatus });

export const addSyncListener = (callback: SyncCallback): (() => void) => {
  listeners.add(callback);
  callback(syncStatus);
  return () => listeners.delete(callback);
};

const notifyListeners = () => {
  listeners.forEach(cb => cb({ ...syncStatus }));
};

const updateStatus = (updates: Partial<SyncStatus>) => {
  syncStatus = { ...syncStatus, ...updates };
  notifyListeners();
};

export const syncItem = async (item: any): Promise<boolean> => {
  try {
    const endpoint = getEndpoint(item.type, item.action, item.data);
    const method = getMethod(item.action);

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Sync error:', error);
    return false;
  }
};

const getEndpoint = (type: string, action: string, data?: any): string => {
  const endpoints: Record<string, string> = {
    'transaction-create': '/api/transactions',
    'transaction-update': `/api/transactions/${data?.id}`,
    'transaction-delete': `/api/transactions/${data?.id}`,
    'customer-create': '/api/customers',
    'customer-update': `/api/customers/${data?.id}`,
    'customer-delete': `/api/customers/${data?.id}`,
    'service-create': '/api/services',
    'service-update': `/api/services/${data?.id}`,
    'service-delete': `/api/services/${data?.id}`,
  };
  return endpoints[`${type}-${action}`] || '/api/sync';
};

const getMethod = (action: string): string => {
  switch (action) {
    case 'create': return 'POST';
    case 'update': return 'PUT';
    case 'delete': return 'DELETE';
    default: return 'POST';
  }
};

export const processSyncQueue = async (): Promise<void> => {
  if (!navigator.onLine || syncStatus.isSyncing) return;

  updateStatus({ isSyncing: true });

  const queue = await getSyncQueue();
  updateStatus({ pendingItems: queue.length });

  const failedItems: string[] = [];

  for (const item of queue) {
    const success = await syncItem(item);

    if (success) {
      await removeFromSyncQueue(item.id);
    } else {
      if (item.retryCount >= MAX_RETRIES) {
        await removeFromSyncQueue(item.id);
        failedItems.push(item.id);
      } else {
        await updateSyncQueueItem({
          ...item,
          retryCount: item.retryCount + 1,
        });
      }
    }
  }

  const updatedQueue = await getSyncQueue();
  await setLastSyncTime();

  updateStatus({
    isSyncing: false,
    pendingItems: updatedQueue.length,
    lastSyncTime: Date.now(),
    errors: failedItems,
  });
};

export const startAutoSync = (): void => {
  if (syncIntervalId) return;

  processSyncQueue();
  syncIntervalId = window.setInterval(processSyncQueue, SYNC_INTERVAL);
};

export const stopAutoSync = (): void => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
};

export const initializeSync = (): void => {
  window.addEventListener('online', () => {
    updateStatus({ isOnline: true });
    processSyncQueue();
  });

  window.addEventListener('offline', () => {
    updateStatus({ isOnline: false });
  });

  if (navigator.onLine) {
    processSyncQueue();
  }

  startAutoSync();
};
