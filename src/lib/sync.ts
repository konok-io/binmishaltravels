import { syncManager, type SyncStatus } from './syncManager';

export const initializeSync = () => {
  syncManager.startAutoSync();
};

export const syncNow = () => syncManager.syncNow();

export const getSyncStatus = (): SyncStatus => syncManager.getStatus();

export const addSyncListener = (callback: (status: SyncStatus) => void) => {
  return syncManager.addListener(callback);
};

export const queueTransaction = (action: 'create' | 'update' | 'delete', data: any) => {
  return syncManager.queueTransaction(action, data);
};

export const queueCustomer = (action: 'create' | 'update' | 'delete', data: any) => {
  return syncManager.queueCustomer(action, data);
};

export const queueService = (action: 'create' | 'update' | 'delete', data: any) => {
  return syncManager.queueService(action, data);
};

export const queueBranch = (action: 'create' | 'update' | 'delete', data: any) => {
  return syncManager.queueBranch(action, data);
};

export type { SyncStatus } from './syncManager';
