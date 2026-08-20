import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import { useAppStore } from '@/store';
import { useI18n } from '@/i18n';
import { initializeSync } from '@/lib/sync';

export const Layout: React.FC = () => {
  const { sidebarOpen } = useAppStore();
  const { isRTL } = useI18n();

  useEffect(() => {
    initializeSync();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarOpen ? (isRTL ? 'mr-64' : 'ml-64') : isRTL ? 'mr-0' : 'ml-0'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <OfflineIndicator />
    </div>
  );
};
