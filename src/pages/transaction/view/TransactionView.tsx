import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useTransactionStore, useCustomerStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const TransactionView: React.FC = () => {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { transactions, deleteTransaction } = useTransactionStore();
  const { customers } = useCustomerStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find transaction by ID
  const transaction = useMemo(() => {
    return transactions.find(t => t.id === id);
  }, [transactions, id]);

  // Find customer
  const customer = useMemo(() => {
    if (!transaction) return null;
    return customers.find(c => c.id === transaction.customerId);
  }, [customers, transaction]);

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {t(status)}
      </span>
    );
  };

  // Get payment badge
  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-orange-100 text-orange-800',
      due: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {t(status)}
      </span>
    );
  };

  // Handle delete
  const handleDelete = () => {
    if (!transaction) return;
    deleteTransaction(transaction.id);
    navigate('/transactions');
  };

  if (!transaction) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('transactionDetails')}</h1>
          <Button variant="outline" onClick={() => navigate('/transactions')}>
            {t('back')}
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('transactionNotFound')}</h2>
            <p className="text-gray-500">{t('transactionNotFoundDesc')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/transactions')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('transactionDetails')}</h1>
            <p className="text-gray-600">{transaction.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/transaction/${transaction.id}/edit`)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('edit')}
          </Button>
          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowDeleteConfirm(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('delete')}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="text-center py-4">
            <p className="text-sm opacity-90">{t('service')}</p>
            <p className="text-xl font-bold mt-1">{transaction.serviceName}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="text-center py-4">
            <p className="text-sm opacity-90">{t('status')}</p>
            <div className="mt-1">{getStatusBadge(transaction.status)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="text-center py-4">
            <p className="text-sm opacity-90">{t('payment')}</p>
            <div className="mt-1">{getPaymentBadge(transaction.paymentStatus)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('transactionInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('transactionId')}</p>
                <p className="font-medium">{transaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('branch')}</p>
                <p className="font-medium">{transaction.branchName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('createdAt')}</p>
                <p className="font-medium">{formatDate(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('staff')}</p>
                <p className="font-medium">{transaction.staffName}</p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('serviceDetails')}</h4>
              <div className="space-y-2 text-sm">
                {transaction.details && Object.entries(transaction.details).map(([key, value]) => {
                  if (!value || key === 'notes') return null;
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500">{t(key) || key}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {transaction.details?.notes && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('notes')}</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{transaction.details.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('customerInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('customerName')}</p>
                <p className="font-medium text-lg">{transaction.customerName}</p>
              </div>
              {customer && (
                <Link to={`/customer/${customer.id}`}>
                  <Button variant="outline" size="sm">{t('viewProfile')}</Button>
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">{t('phoneNumber')}</p>
                <p className="font-medium">{transaction.customerPhone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('passport')}</p>
                <p className="font-medium">{transaction.customerPassport || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('paymentSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">{t('totalAmount')}</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(transaction.amount)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">{t('paidAmount')}</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(transaction.paidAmount)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">{t('dueAmount')}</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(transaction.dueAmount)}</p>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">{t('remaining')}</p>
              <p className="text-2xl font-bold text-gray-700">
                {transaction.dueAmount === 0 ? (
                  <span className="text-green-600">{t('fullyPaid')}</span>
                ) : (
                  <span>{((transaction.dueAmount / transaction.amount) * 100).toFixed(0)}%</span>
                )}
              </p>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>{t('paymentProgress')}</span>
              <span>{((transaction.paidAmount / transaction.amount) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(transaction.paidAmount / transaction.amount) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('deleteTransaction')}</h3>
              <p className="text-gray-600 mb-6">{t('deleteTransactionConfirm')}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>{t('cancel')}</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>{t('delete')}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
