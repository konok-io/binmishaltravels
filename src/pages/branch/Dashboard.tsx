import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore, useTransactionStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { DashboardCharts } from './DashboardCharts';

export const Dashboard: React.FC = () => {
  const { t, language } = useI18n();
  const { user, currentBranch } = useAuthStore();
  const { getDashboardStats, getRecentTransactions } = useTransactionStore();
  const [showCharts, setShowCharts] = useState(false);

  const stats = getDashboardStats(user?.role === 'super_admin' ? undefined : user?.branchId);
  const recentTransactions = getRecentTransactions(5, user?.role === 'super_admin' ? undefined : user?.branchId);

  const isSuperAdmin = user?.role === 'super_admin';

  const quickActions = [
    { path: '/transactions/new?type=air_ticket', label: t('airTicket'), icon: '✈️', color: 'bg-blue-500' },
    { path: '/transactions/new?type=visa', label: t('visa'), icon: '📋', color: 'bg-green-500' },
    { path: '/transactions/new?type=iqama', label: t('iqama'), icon: '🪪', color: 'bg-purple-500' },
    { path: '/transactions/new?type=cargo', label: t('cargo'), icon: '📦', color: 'bg-orange-500' },
    { path: '/transactions/new?type=umrah', label: t('umrah'), icon: '🕋', color: 'bg-teal-500' },
    { path: '/customers/new', label: t('addCustomer'), icon: '👤', color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('welcome')}, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin ? t('allBranches') : currentBranch?.name} - {t('dashboard')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showCharts
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {showCharts ? t('hideCharts') : t('showCharts')}
            </span>
          </button>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && <DashboardCharts />}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm">{t('todayOverview')}</p>
                <p className="text-3xl font-bold mt-2">{stats.todayTransactions}</p>
                <p className="text-blue-100 text-sm mt-1">{t('transactions')}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm">
                <span className="font-semibold">{stats.todayRevenue.toLocaleString()}</span> SAR
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm">{t('completedServices')}</p>
                <p className="text-3xl font-bold mt-2">{stats.completedServices}</p>
                <p className="text-green-100 text-sm mt-1">{t('completed')}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-100 text-sm">{t('pendingServices')}</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingServices}</p>
                <p className="text-orange-100 text-sm mt-1">{t('pending')}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm">{t('totalRevenue')}</p>
                <p className="text-3xl font-bold mt-2">{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-purple-100 text-sm mt-1">SAR</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center hover:opacity-90 transition-opacity`}
                >
                  <span className="text-2xl mb-1">{action.icon}</span>
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>{t('recentTransactions')}</CardTitle>
            <Link to="/transactions" className="text-primary-600 text-sm hover:underline">
              {t('view')} {t('all')}
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{txn.serviceId === '1' ? '✈️' : '📋'}</span>
                      <div>
                        <p className="font-medium text-gray-900">{txn.serviceName}</p>
                        <p className="text-sm text-gray-500">{txn.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{txn.amount} SAR</p>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                        txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {t(txn.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>{t('noData')}</p>
                <Link to="/transactions/new" className="text-primary-600 hover:underline mt-2 inline-block">
                  {t('newTransaction')}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Due amount alert */}
      {stats.dueAmount > 0 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">{t('dueAmount')}</p>
                  <p className="text-sm text-gray-600">Pending payments from customers</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">{stats.dueAmount.toLocaleString()} SAR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
