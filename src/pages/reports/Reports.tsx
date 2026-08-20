import React, { useState, useMemo } from 'react';
import { useI18n } from '@/i18n';
import { useAuthStore, useTransactionStore, useBranchStore, useServiceStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom' | 'branch';

export const Reports: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const { transactions } = useTransactionStore();
  const { branches } = useBranchStore();
  const { services } = useServiceStore();

  const isSuperAdmin = user?.role === 'super_admin';

  // Filters
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedBranch, setSelectedBranch] = useState<string>(isSuperAdmin ? 'all' : user?.branchId || 'all');
  const [dateFrom, setDateFrom] = useState<string>(getDefaultDateFrom());
  const [dateTo, setDateTo] = useState<string>(getDefaultDateTo());

  // Get default dates
  function getDefaultDateFrom(): string {
    const today = new Date();
    today.setDate(today.getDate() - 30);
    return today.toISOString().split('T')[0];
  }

  function getDefaultDateTo(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Quick date selection
  const setDateRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let txns = transactions;
    
    if (selectedBranch !== 'all') {
      txns = txns.filter(t => t.branchId === selectedBranch);
    }
    
    const fromDate = new Date(dateFrom);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999);
    
    return txns.filter(t => {
      const txnDate = new Date(t.createdAt);
      return txnDate >= fromDate && txnDate <= toDate;
    });
  }, [transactions, selectedBranch, dateFrom, dateTo]);

  // Statistics
  const stats = useMemo(() => {
    const totalTxns = filteredTransactions.length;
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCollected = filteredTransactions.reduce((sum, t) => sum + t.paidAmount, 0);
    const totalDue = filteredTransactions.reduce((sum, t) => sum + t.dueAmount, 0);
    
    const completed = filteredTransactions.filter(t => t.status === 'completed').length;
    const pending = filteredTransactions.filter(t => t.status === 'pending' || t.status === 'processing').length;
    const cancelled = filteredTransactions.filter(t => t.status === 'cancelled').length;

    // Service breakdown
    const serviceMap = new Map<string, { name: string; count: number; revenue: number }>();
    filteredTransactions.forEach(t => {
      const existing = serviceMap.get(t.serviceCode);
      if (existing) {
        existing.count++;
        existing.revenue += t.amount;
      } else {
        const service = services.find(s => s.code === t.serviceCode);
        serviceMap.set(t.serviceCode, {
          name: service?.name || t.serviceName,
          count: 1,
          revenue: t.amount,
        });
      }
    });

    // Branch breakdown (for super admin)
    const branchMap = new Map<string, { name: string; count: number; revenue: number }>();
    if (isSuperAdmin) {
      filteredTransactions.forEach(t => {
        const existing = branchMap.get(t.branchId);
        if (existing) {
          existing.count++;
          existing.revenue += t.amount;
        } else {
          const branch = branches.find(b => b.id === t.branchId);
          branchMap.set(t.branchId, {
            name: branch?.name || t.branchName,
            count: 1,
            revenue: t.amount,
          });
        }
      });
    }

    return {
      totalTxns,
      totalRevenue,
      totalCollected,
      totalDue,
      completed,
      pending,
      cancelled,
      services: Array.from(serviceMap.values()),
      branches: Array.from(branchMap.values()),
    };
  }, [filteredTransactions, services, branches, isSuperAdmin]);

  // Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reports')}</h1>
          <p className="text-gray-600 mt-1">{t('generateAndViewReports')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {t('print')}
          </Button>
          <Button variant="outline">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('export')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reportType')}</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="daily">{t('dailyReport')}</option>
                <option value="weekly">{t('weeklyReport')}</option>
                <option value="monthly">{t('monthlyReport')}</option>
                <option value="custom">{t('customReport')}</option>
                {isSuperAdmin && <option value="branch">{t('branchReport')}</option>}
              </select>
            </div>

            {/* Quick Date Buttons */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('quickSelect')}</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDateRange(7)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('last7Days')}
                </button>
                <button
                  onClick={() => setDateRange(30)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('last30Days')}
                </button>
                <button
                  onClick={() => setDateRange(90)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('last90Days')}
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setDateFrom(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
                    setDateTo(now.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('thisMonth')}
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setDateFrom(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
                    setDateTo(new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]);
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('thisYear')}
                </button>
              </div>
            </div>

            {/* Branch Filter */}
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('branch')}</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">{t('allBranches')}</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fromDate')}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('toDate')}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('generateReport')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">{t('totalTransactions')}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTxns}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">{t('completed')}</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">{t('pending')}</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">{t('cancelled')}</p>
          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 lg:col-span-2">
          <p className="text-sm text-blue-600">{t('totalRevenue')}</p>
          <p className="text-2xl font-bold text-blue-700">{stats.totalRevenue.toLocaleString()} SAR</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Collection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('revenueSummary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-green-600">{t('totalRevenue')}</p>
                    <p className="text-xl font-bold text-green-700">{stats.totalRevenue.toLocaleString()} SAR</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-green-600">{t('collected')}</p>
                    <p className="text-xl font-bold text-green-700">{stats.totalCollected.toLocaleString()} SAR</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm text-red-600">{t('dueAmount')}</p>
                    <p className="text-xl font-bold text-red-700">{stats.totalDue.toLocaleString()} SAR</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Collection Rate */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{t('collectionRate')}</span>
                    <span className="font-medium">
                      {stats.totalRevenue > 0 
                        ? Math.round((stats.totalCollected / stats.totalRevenue) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalRevenue > 0 ? (stats.totalCollected / stats.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Breakdown */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('serviceBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.services.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('service')}</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{t('count')}</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('amount')}</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.services.map((service, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.name}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">{service.count}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{service.revenue.toLocaleString()} SAR</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">
                            {stats.totalRevenue > 0 ? Math.round((service.revenue / stats.totalRevenue) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{t('total')}</td>
                        <td className="px-4 py-3 text-sm font-bold text-center text-gray-900">
                          {stats.services.reduce((sum, s) => sum + s.count, 0)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">
                          {stats.totalRevenue.toLocaleString()} SAR
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>{t('noDataForSelectedPeriod')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Branch Breakdown (Super Admin Only) */}
      {isSuperAdmin && stats.branches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('branchBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stats.branches.map((branch, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{branch.name}</h4>
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded-full">
                      {stats.totalTxns > 0 ? Math.round((branch.count / stats.totalTxns) * 100) : 0}%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary-600">{branch.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{branch.count} {t('transactions')}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${stats.totalRevenue > 0 ? (branch.revenue / stats.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>{t('recentTransactions')}</CardTitle>
          <span className="text-sm text-gray-500">
            {filteredTransactions.length} {t('transactions')} {t('from')} {dateFrom} {t('to')} {dateTo}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customer')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('service')}</th>
                    {isSuperAdmin && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('branch')}</th>
                    )}
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('amount')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.slice(0, 10).map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{txn.customerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{txn.serviceName}</td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3 text-sm text-gray-600">{txn.branchName}</td>
                      )}
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {txn.amount.toLocaleString()} SAR
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                          txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          txn.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t(txn.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>{t('noDataForSelectedPeriod')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
