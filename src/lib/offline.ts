import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { ServiceTransaction, Customer, Service } from '@/types';

interface SyncQueueItem {
  id: string;
  type: 'transaction' | 'customer' | 'service';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface BinMishalDB extends DBSchema {
  transactions: {
    key: string;
    value: ServiceTransaction;
    indexes: { 'by-customer': string; 'by-branch': string };
  };
  customers: {
    key: string;
    value: Customer;
    indexes: { 'by-branch': string };
  };
  services: {
    key: string;
    value: Service;
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-timestamp': number };
  };
  metadata: {
    key: string;
    value: { key: string; value: any; updatedAt: number };
  };
}

const DB_NAME = 'binmishal-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<BinMishalDB>> | null = null;

export const getDB = async (): Promise<IDBPDatabase<BinMishalDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<BinMishalDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('transactions')) {
          const txnStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txnStore.createIndex('by-customer', 'customerId');
          txnStore.createIndex('by-branch', 'branchId');
        }

        if (!db.objectStoreNames.contains('customers')) {
          const custStore = db.createObjectStore('customers', { keyPath: 'id' });
          custStore.createIndex('by-branch', 'branchId');
        }

        if (!db.objectStoreNames.contains('services')) {
          db.createObjectStore('services', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('by-timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveTransactionOffline = async (transaction: ServiceTransaction): Promise<void> => {
  const db = await getDB();
  await db.put('transactions', transaction);
};

export const getTransactionOffline = async (id: string): Promise<ServiceTransaction | undefined> => {
  const db = await getDB();
  return db.get('transactions', id);
};

export const getAllTransactionsOffline = async (branchId?: string): Promise<ServiceTransaction[]> => {
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

export const saveCustomerOffline = async (customer: Customer): Promise<void> => {
  const db = await getDB();
  await db.put('customers', customer);
};

export const getCustomerOffline = async (id: string): Promise<Customer | undefined> => {
  const db = await getDB();
  return db.get('customers', id);
};

export const getAllCustomersOffline = async (branchId?: string): Promise<Customer[]> => {
  const db = await getDB();
  if (branchId) {
    return db.getAllFromIndex('customers', 'by-branch', branchId);
  }
  return db.getAll('customers');
};

export const saveServiceOffline = async (service: Service): Promise<void> => {
  const db = await getDB();
  await db.put('services', service);
};

export const getAllServicesOffline = async (): Promise<Service[]> => {
  const db = await getDB();
  return db.getAll('services');
};

export const addToSyncQueue = async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> => {
  const db = await getDB();
  const syncItem: SyncQueueItem = {
    ...item,
    id: `${item.type}-${item.action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retryCount: 0,
  };
  await db.put('syncQueue', syncItem);
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  const db = await getDB();
  return db.getAllFromIndex('syncQueue', 'by-timestamp');
};

export const removeFromSyncQueue = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('syncQueue', id);
};

export const updateSyncQueueItem = async (item: SyncQueueItem): Promise<void> => {
  const db = await getDB();
  await db.put('syncQueue', item);
};

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

export const clearOfflineData = async (): Promise<void> => {
  const db = await getDB();
  await db.clear('transactions');
  await db.clear('customers');
  await db.clear('services');
  await db.clear('syncQueue');
  await db.clear('metadata');
};
