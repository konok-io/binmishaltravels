import React, { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { getSyncStatus, addSyncListener, processSyncQueue, type SyncStatus } from '@/lib/sync';

export const OfflineIndicator: React.FC = () => {
  const { t } = useI18n();
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const unsubscribe = addSyncListener(setStatus);
    return unsubscribe;
  }, []);

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString();
  };

  if (status.isOnline && status.pendingItems === 0) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {!status.isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 z-50 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
              <span className="font-medium">{t('offline')}</span>
              <span className="text-red-200 text-sm">- {t('offlineMessage')}</span>
            </div>
            {status.pendingItems > 0 && (
              <span className="bg-red-700 px-3 py-1 rounded-full text-sm">
                {status.pendingItems} {t('pendingSync')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sync Status Button */}
      {status.pendingItems > 0 && status.isOnline && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="fixed bottom-20 right-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 transition-all"
        >
          <svg className={`w-5 h-5 ${status.isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="font-medium">
            {status.isSyncing ? t('syncing') : `${status.pendingItems} ${t('pendingSync')}`}
          </span>
        </button>
      )}

      {/* Sync Details Panel */}
      {showDetails && status.pendingItems > 0 && (
        <div className="fixed bottom-20 right-4 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{t('syncDetails')}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('pendingItems')}:</span>
              <span className="font-medium">{status.pendingItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('lastSync')}:</span>
              <span className="font-medium">{formatTime(status.lastSyncTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('status')}:</span>
              <span className={`font-medium ${status.isSyncing ? 'text-blue-600' : status.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {status.isSyncing ? t('syncing') : status.isOnline ? t('online') : t('offline')}
              </span>
            </div>
            {status.isOnline && (
              <button
                onClick={() => processSyncQueue()}
                disabled={status.isSyncing}
                className="w-full mt-2 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status.isSyncing ? t('syncing') : t('syncNow')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Online indicator (subtle) */}
      {status.isOnline && status.pendingItems === 0 && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="bg-green-500 w-3 h-3 rounded-full border-2 border-white shadow-lg" title={t('online')} />
        </div>
      )}
    </>
  );
};
