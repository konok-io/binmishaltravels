import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore, useTransactionStore, useBranchStore, useServiceStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

type FilterStatus = 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

export const Transactions: React.FC = () => {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { transactions } = useTransactionStore();
  const { branches } = useBranchStore();
  const { services } = useServiceStore();

  const isSuperAdmin = user?.role === 'super_admin';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>(isSuperAdmin ? 'all' : user?.branchId || 'all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          txn.customerName.toLowerCase().includes(query) ||
          txn.serviceName.toLowerCase().includes(query) ||
          txn.id.toLowerCase().includes(query) ||
          txn.customerPhone?.includes(query) ||
          txn.customerPassport?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Branch filter
      if (selectedBranch !== 'all' && txn.branchId !== selectedBranch) {
        return false;
      }

      // Service filter
      if (selectedService !== 'all' && txn.serviceCode !== selectedService) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && txn.status !== selectedStatus) {
        return false;
      }

      // Date range filter
      if (dateFrom) {
        const txnDate = new Date(txn.createdAt);
        const fromDate = new Date(dateFrom);
        if (txnDate < fromDate) return false;
      }
      if (dateTo) {
        const txnDate = new Date(txn.createdAt);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (txnDate > toDate) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, searchQuery, selectedBranch, selectedService, selectedStatus, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = useMemo(() => {
    return {
      total: filteredTransactions.length,
      completed: filteredTransactions.filter(t => t.status === 'completed').length,
      pending: filteredTransactions.filter(t => t.status === 'pending' || t.status === 'processing').length,
      totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      collected: filteredTransactions.reduce((sum, t) => sum + t.paidAmount, 0),
      due: filteredTransactions.reduce((sum, t) => sum + t.dueAmount, 0),
    };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBranch(isSuperAdmin ? 'all' : user?.branchId || 'all');
    setSelectedService('all');
    setSelectedStatus('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(
      language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
        {t(status)}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      paid: 'text-green-600',
      partial: 'text-orange-600',
      due: 'text-red-600',
    };
    return (
      <span className={`text-xs font-medium ${styles[status as keyof typeof styles] || ''}`}>
        {t(status)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('transactions')}</h1>
          <p className="text-gray-600 mt-1">{t('manageYourTransactions')}</p>
        </div>
        <Link to="/transactions/new">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('newTransaction')}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">{t('total')}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">{t('completed')}</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">{t('pending')}</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">{t('totalAmount')}</p>
          <p className="text-lg font-bold text-blue-700">{stats.totalAmount.toLocaleString()} SAR</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">{t('collected')}</p>
          <p className="text-lg font-bold text-green-700">{stats.collected.toLocaleString()} SAR</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">{t('dueAmount')}</p>
          <p className="text-lg font-bold text-red-700">{stats.due.toLocaleString()} SAR</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                type="text"
                placeholder={t('searchByCustomer')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            {/* Branch Filter */}
            {isSuperAdmin && (
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t('allBranches')}</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            )}

            {/* Service Filter */}
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('allServices')}</option>
              {services.map(service => (
                <option key={service.id} value={service.code}>{service.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as FilterStatus);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('allStatus')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="processing">{t('processing')}</option>
              <option value="completed">{t('completed')}</option>
              <option value="cancelled">{t('cancelled')}</option>
            </select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters}>
              {t('clearFilters')}
            </Button>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fromDate')}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('toDate')}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>{t('transactionList')}</CardTitle>
          <span className="text-sm text-gray-500">
            {t('showing')} {paginatedTransactions.length} {t('of')} {filteredTransactions.length} {t('transactions')}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('customer')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('service')}</th>
                    {isSuperAdmin && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('branch')}</th>
                    )}
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('payment')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{formatDate(txn.createdAt)}</p>
                          <p className="text-gray-500 text-xs">{formatTime(txn.createdAt)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{txn.customerName}</p>
                          <p className="text-gray-500 text-xs">{txn.customerPhone || '-'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{txn.serviceName}</p>
                          <p className="text-gray-500 text-xs">ID: {txn.id.slice(0, 8)}</p>
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{txn.branchName}</span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm">
                          <p className="font-bold text-gray-900">{txn.amount.toLocaleString()} SAR</p>
                          {txn.dueAmount > 0 && (
                            <p className="text-red-500 text-xs">{t('due')}: {txn.dueAmount} SAR</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getPaymentBadge(txn.paymentStatus)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(txn.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title={t('view')}
                            onClick={() => navigate(`/transaction/${txn.id}`)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            className="p-1 text-green-600 hover:text-green-800"
                            title={t('edit')}
                            onClick={() => navigate(`/transaction/${txn.id}/edit`)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noTransactions')}</h3>
              <p className="text-gray-500 mb-4">{t('noTransactionsDesc')}</p>
              <Link to="/transactions/new">
                <Button>{t('createFirstTransaction')}</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              {t('previous')}
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
