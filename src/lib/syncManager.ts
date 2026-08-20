import {
  addToSyncQueue,
  getPendingSyncItems,
  markSyncItemSyncing,
  markSyncItemComplete,
  markSyncItemFailed,
  getLastSyncTime,
  setLastSyncTime,
  bulkSaveTransactions,
  bulkSaveCustomers,
  bulkSaveServices,
  bulkSaveBranches,
} from './offline';
import { dataProvider } from '@/api/dataProvider';

const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30 seconds

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncTime: number | null;
  conflicts: number;
}

type SyncListener = (status: SyncStatus) => void;

class SyncManager {
  private listeners: Set<SyncListener> = new Set();
  private syncIntervalId: number | null = null;
  private status: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    lastSyncTime: null,
    conflicts: 0,
  };

  constructor() {
    this.init();
  }

  private async init() {
    // Load last sync time
    const lastSync = await getLastSyncTime();
    this.status.lastSyncTime = lastSync;

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Initial sync check
    if (navigator.onLine) {
      await this.processQueue();
    }

    // Start auto-sync
    this.startAutoSync();
  }

  private handleOnline() {
    this.status.isOnline = true;
    this.notifyListeners();
    this.processQueue();
  }

  private handleOffline() {
    this.status.isOnline = false;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb({ ...this.status }));
  }

  public addListener(callback: SyncListener): () => void {
    this.listeners.add(callback);
    callback({ ...this.status });
    return () => this.listeners.delete(callback);
  }

  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  public startAutoSync() {
    if (this.syncIntervalId) return;
    this.syncIntervalId = window.setInterval(() => {
      if (navigator.onLine) {
        this.processQueue();
      }
    }, SYNC_INTERVAL);
  }

  public stopAutoSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  public async syncNow(): Promise<void> {
    await this.processQueue();
  }

  private async processQueue() {
    if (!navigator.onLine || this.status.isSyncing) return;

    this.status.isSyncing = true;
    this.notifyListeners();

    try {
      const pendingItems = await getPendingSyncItems();
      this.status.pendingCount = pendingItems.length;

      let failedCount = 0;

      for (const item of pendingItems) {
        if (item.retryCount >= MAX_RETRIES) {
          failedCount++;
          continue;
        }

        try {
          await markSyncItemSyncing(item.id);
          await this.syncItem(item);
          await markSyncItemComplete(item.id);
        } catch (error: any) {
          await markSyncItemFailed(item.id, error.message);
          failedCount++;
        }
      }

      this.status.failedCount = failedCount;
      await setLastSyncTime();
      this.status.lastSyncTime = Date.now();

      // Pull latest data from server
      await this.pullServerData();

    } catch (error) {
      console.error('Sync queue processing error:', error);
    } finally {
      this.status.isSyncing = false;
      this.status.pendingCount = (await getPendingSyncItems()).length;
      this.notifyListeners();
    }
  }

  private async syncItem(item: any): Promise<void> {
    const { type, action, data } = item;

    switch (type) {
      case 'transaction':
        await this.syncTransaction(action, data);
        break;
      case 'customer':
        await this.syncCustomer(action, data);
        break;
      case 'service':
        await this.syncService(action, data);
        break;
      case 'branch':
        await this.syncBranch(action, data);
        break;
    }
  }

  private async syncTransaction(action: string, data: any) {
    switch (action) {
      case 'create':
        await dataProvider.transactions.create(data);
        break;
      case 'update':
        await dataProvider.transactions.update(data.id, data);
        break;
      case 'delete':
        await dataProvider.transactions.delete(data.id);
        break;
    }
  }

  private async syncCustomer(action: string, data: any) {
    switch (action) {
      case 'create':
        await dataProvider.customers.create(data);
        break;
      case 'update':
        await dataProvider.customers.update(data.id, data);
        break;
      case 'delete':
        await dataProvider.customers.delete(data.id);
        break;
    }
  }

  private async syncService(action: string, data: any) {
    switch (action) {
      case 'create':
        await dataProvider.services.create(data);
        break;
      case 'update':
        await dataProvider.services.update(data.id, data);
        break;
      case 'delete':
        await dataProvider.services.delete(data.id);
        break;
    }
  }

  private async syncBranch(action: string, data: any) {
    switch (action) {
      case 'create':
        await dataProvider.branches.create(data);
        break;
      case 'update':
        await dataProvider.branches.update(data.id, data);
        break;
      case 'delete':
        await dataProvider.branches.delete(data.id);
        break;
    }
  }

  private async pullServerData() {
    if (!navigator.onLine) return;

    try {
      // Pull all data from server and update local cache
      const [transactions, customers, services, branches] = await Promise.all([
        dataProvider.transactions.getAll(),
        dataProvider.customers.getAll(),
        dataProvider.services.getAll(),
        dataProvider.branches.getAll(),
      ]);

      // Bulk save to IndexedDB
      await Promise.all([
        bulkSaveTransactions(transactions),
        bulkSaveCustomers(customers),
        bulkSaveServices(services),
        bulkSaveBranches(branches),
      ]);

    } catch (error) {
      console.error('Error pulling server data:', error);
    }
  }

  // Queue operations
  public async queueTransaction(action: 'create' | 'update' | 'delete', data: any) {
    await addToSyncQueue({ type: 'transaction', action, data });
    this.status.pendingCount++;
    this.notifyListeners();

    // Try immediate sync if online
    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  public async queueCustomer(action: 'create' | 'update' | 'delete', data: any) {
    await addToSyncQueue({ type: 'customer', action, data });
    this.status.pendingCount++;
    this.notifyListeners();

    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  public async queueService(action: 'create' | 'update' | 'delete', data: any) {
    await addToSyncQueue({ type: 'service', action, data });
    this.status.pendingCount++;
    this.notifyListeners();

    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  public async queueBranch(action: 'create' | 'update' | 'delete', data: any) {
    await addToSyncQueue({ type: 'branch', action, data });
    this.status.pendingCount++;
    this.notifyListeners();

    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 100);
    }
  }
}

// Singleton instance
export const syncManager = new SyncManager();
export default syncManager;
