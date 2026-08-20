import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SyncQueueItem {
  id: string;
  type: 'transaction' | 'customer' | 'service' | 'branch';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
  localVersion?: number;
  serverVersion?: number;
}

interface BinMishalDB extends DBSchema {
  transactions: {
    key: string;
    value: any;
    indexes: { 'by-customer': string; 'by-branch': string; 'by-updated': number };
  };
  customers: {
    key: string;
    value: any;
    indexes: { 'by-branch': string; 'by-updated': number };
  };
  services: {
    key: string;
    value: any;
  };
  branches: {
    key: string;
    value: any;
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-timestamp': number; 'by-status': string };
  };
  metadata: {
    key: string;
    value: { key: string; value: any; updatedAt: number };
  };
  conflicts: {
    key: string;
    value: {
      id: string;
      type: string;
      localData: any;
      serverData: any;
      timestamp: number;
      resolved: boolean;
    };
  };
}

const DB_NAME = 'binmishal-offline-v2';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<BinMishalDB>> | null = null;

export const getDB = async (): Promise<IDBPDatabase<BinMishalDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<BinMishalDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const txnStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txnStore.createIndex('by-customer', 'customerId');
          txnStore.createIndex('by-branch', 'branchId');
          txnStore.createIndex('by-updated', 'updatedAt');

          const custStore = db.createObjectStore('customers', { keyPath: 'id' });
          custStore.createIndex('by-branch', 'branchId');
          custStore.createIndex('by-updated', 'updatedAt');

          db.createObjectStore('services', { keyPath: 'id' });
          db.createObjectStore('branches', { keyPath: 'id' });

          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('by-timestamp', 'timestamp');
          syncStore.createIndex('by-status', 'status');

          db.createObjectStore('metadata', { keyPath: 'key' });
          db.createObjectStore('conflicts', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Transaction operations
export const saveTransactionOffline = async (transaction: any): Promise<void> => {
  const db = await getDB();
  const updated = { ...transaction, updatedAt: Date.now(), localVersion: (transaction.localVersion || 0) + 1 };
  await db.put('transactions', updated);
};

export const getTransactionOffline = async (id: string): Promise<any | undefined> => {
  const db = await getDB();
  return db.get('transactions', id);
};

export const getAllTransactionsOffline = async (branchId?: string): Promise<any[]> => {
  const db = await getDB();
  if (branchId) {
    return db.getAllFromIndex('transactions', 'by-branch', branchId);
  }
  return db.getAll('transactions');
};

export const deleteTransactionOffline = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('transactions', id);
};

export const getPendingSyncTransactions = async (): Promise<any[]> => {
  const db = await getDB();
  const all = await db.getAllFromIndex('syncQueue', 'by-status', 'pending');
  return all.filter(item => item.type === 'transaction');
};

// Customer operations
export const saveCustomerOffline = async (customer: any): Promise<void> => {
  const db = await getDB();
  const updated = { ...customer, updatedAt: Date.now(), localVersion: (customer.localVersion || 0) + 1 };
  await db.put('customers', updated);
};

export const getCustomerOffline = async (id: string): Promise<any | undefined> => {
  const db = await getDB();
  return db.get('customers', id);
};

export const getAllCustomersOffline = async (branchId?: string): Promise<any[]> => {
  const db = await getDB();
  if (branchId) {
    return db.getAllFromIndex('customers', 'by-branch', branchId);
  }
  return db.getAll('customers');
};

// Service operations
export const saveServiceOffline = async (service: any): Promise<void> => {
  const db = await getDB();
  await db.put('services', service);
};

export const getAllServicesOffline = async (): Promise<any[]> => {
  const db = await getDB();
  return db.getAll('services');
};

// Branch operations
export const saveBranchOffline = async (branch: any): Promise<void> => {
  const db = await getDB();
  await db.put('branches', branch);
};

export const getAllBranchesOffline = async (): Promise<any[]> => {
  const db = await getDB();
  return db.getAll('branches');
};

// Sync Queue operations
export const addToSyncQueue = async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> => {
  const db = await getDB();
  const id = `${item.type}-${item.action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const syncItem: SyncQueueItem = {
    ...item,
    id,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending',
  };
  await db.put('syncQueue', syncItem);
  return id;
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  const db = await getDB();
  return db.getAllFromIndex('syncQueue', 'by-timestamp');
};

export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  const db = await getDB();
  return db.getAllFromIndex('syncQueue', 'by-status', 'pending');
};

export const removeFromSyncQueue = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('syncQueue', id);
};

export const updateSyncQueueItem = async (item: SyncQueueItem): Promise<void> => {
  const db = await getDB();
  await db.put('syncQueue', item);
};

export const markSyncItemSyncing = async (id: string): Promise<void> => {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    await db.put('syncQueue', { ...item, status: 'syncing' });
  }
};

export const markSyncItemComplete = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('syncQueue', id);
};

export const markSyncItemFailed = async (id: string, error: string): Promise<void> => {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    await db.put('syncQueue', {
      ...item,
      status: 'failed',
      error,
      retryCount: item.retryCount + 1,
    });
  }
};

// Metadata operations
export const setMetadata = async (key: string, value: any): Promise<void> => {
  const db = await getDB();
  await db.put('metadata', { key, value, updatedAt: Date.now() });
};

export const getMetadata = async (key: string): Promise<any> => {
  const db = await getDB();
  const meta = await db.get('metadata', key);
  return meta?.value;
};

export const getLastSyncTime = async (): Promise<number | null> => {
  const timestamp = await getMetadata('lastSyncTime');
  return timestamp || null;
};

export const setLastSyncTime = async (): Promise<void> => {
  await setMetadata('lastSyncTime', Date.now());
};

// Conflict resolution
interface ConflictRecord {
  id: string;
  type: string;
  localData: any;
  serverData: any;
  timestamp: number;
  resolved: boolean;
  resolution?: 'local' | 'server';
  resolvedAt?: number;
}

export const addConflict = async (localData: any, serverData: any): Promise<void> => {
  const db = await getDB();
  const conflict: ConflictRecord = {
    id: `${localData.type}-${localData.id}-${Date.now()}`,
    type: localData.type,
    localData,
    serverData,
    timestamp: Date.now(),
    resolved: false,
  };
  await db.put('conflicts', conflict);
};

export const getUnresolvedConflicts = async (): Promise<ConflictRecord[]> => {
  const db = await getDB();
  const all = await db.getAll('conflicts');
  return all.filter(c => !c.resolved);
};

export const resolveConflict = async (id: string, useLocal: boolean): Promise<void> => {
  const db = await getDB();
  const conflict = await db.get('conflicts', id) as ConflictRecord | undefined;
  if (conflict) {
    conflict.resolved = true;
    conflict.resolution = useLocal ? 'local' : 'server';
    conflict.resolvedAt = Date.now();
    await db.put('conflicts', conflict);

    // Update local data if server wins
    if (!useLocal && conflict.serverData) {
      const storeMap: Record<string, string> = {
        transaction: 'transactions',
        customer: 'customers',
        service: 'services',
        branch: 'branches',
      };
      const storeName = storeMap[conflict.type];
      if (storeName && db.objectStoreNames.contains(storeName as any)) {
        await db.put(storeName as any, conflict.serverData);
      }
    }
  }
};

// Storage info
export const getStorageInfo = async (): Promise<{ used: number; quota: number; percentage: number }> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
    };
  }
  return { used: 0, quota: 0, percentage: 0 };
};

// Clear all offline data
export const clearOfflineData = async (): Promise<void> => {
  const db = await getDB();
  await db.clear('transactions');
  await db.clear('customers');
  await db.clear('services');
  await db.clear('branches');
  await db.clear('syncQueue');
  await db.clear('conflicts');
  await db.clear('metadata');
};

// Bulk operations
export const bulkSaveTransactions = async (transactions: any[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('transactions', 'readwrite');
  await Promise.all([
    ...transactions.map(t => tx.store.put({ ...t, updatedAt: Date.now() })),
    tx.done,
  ]);
};

export const bulkSaveCustomers = async (customers: any[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('customers', 'readwrite');
  await Promise.all([
    ...customers.map(c => tx.store.put({ ...c, updatedAt: Date.now() })),
    tx.done,
  ]);
};

export const bulkSaveServices = async (services: any[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('services', 'readwrite');
  await Promise.all([
    ...services.map(s => tx.store.put(s)),
    tx.done,
  ]);
};

export const bulkSaveBranches = async (branches: any[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('branches', 'readwrite');
  await Promise.all([
    ...branches.map(b => tx.store.put(b)),
    tx.done,
  ]);
};
