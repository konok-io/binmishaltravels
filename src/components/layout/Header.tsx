import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n, languages } from '@/i18n';
import { useAuthStore, useAppStore } from '@/store';

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const { user, currentBranch, logout } = useAuthStore();
  const { isOnline, isSyncing, pendingChanges } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm fixed top-0 right-0 left-64 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Branch info */}
        <div className="flex items-center">
          <div className="bg-primary-50 text-primary-800 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">
              {currentBranch ? currentBranch.name : t('allBranches')}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Online/Offline indicator */}
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isOnline ? t('online') : t('offline')}
            </span>
            {isSyncing && (
              <svg className="w-4 h-4 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {pendingChanges > 0 && (
              <span className="text-xs text-orange-600">
                ({pendingChanges} {t('pendingChanges')})
              </span>
            )}
          </div>

          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'bn' | 'ar' | 'en')}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName}
              </option>
            ))}
          </select>

          {/* User menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-800">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role === 'super_admin' ? t('superAdmin') : user?.branchName}</p>
              </div>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
