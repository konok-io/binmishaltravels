import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useTransactionStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { ServiceTransaction, ServiceDetails } from '@/types';

export const TransactionEdit: React.FC = () => {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { transactions, updateTransaction } = useTransactionStore();

  // Find transaction by ID
  const transaction = useMemo(() => {
    return transactions.find(t => t.id === id);
  }, [transactions, id]);

  // Form state
  const [formData, setFormData] = useState<Partial<ServiceTransaction>>({});
  const [details, setDetails] = useState<ServiceDetails>({});
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (transaction) {
      setFormData({
        status: transaction.status,
        amount: transaction.amount,
        paidAmount: transaction.paidAmount,
        dueAmount: transaction.dueAmount,
        paymentStatus: transaction.paymentStatus,
      });
      setDetails(transaction.details || {});
      setNotes(transaction.details?.notes || '');
    }
  }, [transaction]);

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

  // Calculate due amount
  const calculatedDue = useMemo(() => {
    const amount = formData.amount || 0;
    const paid = formData.paidAmount || 0;
    return Math.max(0, amount - paid);
  }, [formData.amount, formData.paidAmount]);

  // Determine payment status
  const calculatedPaymentStatus = useMemo(() => {
    const amount = formData.amount || 0;
    const paid = formData.paidAmount || 0;
    if (paid >= amount) return 'paid';
    if (paid > 0) return 'partial';
    return 'due';
  }, [formData.amount, formData.paidAmount]);

  // Handle field change
  const handleChange = (field: keyof ServiceTransaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle detail change
  const handleDetailChange = (key: string, value: any) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = t('required');
    }
    if ((formData.paidAmount || 0) > (formData.amount || 0)) {
      newErrors.paidAmount = t('paidAmountExceedsTotal');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !transaction) return;

    const updatedData: Partial<ServiceTransaction> = {
      status: formData.status as ServiceTransaction['status'],
      amount: formData.amount,
      paidAmount: formData.paidAmount,
      dueAmount: calculatedDue,
      paymentStatus: calculatedPaymentStatus as ServiceTransaction['paymentStatus'],
      details: { ...details, notes },
      updatedAt: new Date().toISOString(),
    };

    updateTransaction(transaction.id, updatedData);
    navigate(`/transaction/${transaction.id}`);
  };

  if (!transaction) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('editTransaction')}</h1>
          <Button variant="outline" onClick={() => navigate('/transactions')}>
            {t('back')}
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('transactionNotFound')}</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(`/transaction/${transaction.id}`)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('editTransaction')}</h1>
            <p className="text-gray-600">{transaction.id}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Transaction Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('transactionInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('transactionId')}</p>
                <p className="font-medium">{transaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('service')}</p>
                <p className="font-medium">{transaction.serviceName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('customer')}</p>
                <p className="font-medium">{transaction.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('createdAt')}</p>
                <p className="font-medium">{formatDate(transaction.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Payment */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('statusPayment')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('status')}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['pending', 'processing', 'completed', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleChange('status', status)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium text-center transition-all ${
                      formData.status === status
                        ? status === 'completed' ? 'border-green-500 bg-green-50 text-green-700' :
                          status === 'pending' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                          status === 'processing' ? 'border-blue-500 bg-blue-50 text-blue-700' :
                          'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {t(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t('totalAmount')}
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                error={errors.amount}
                required
                leftIcon={<span className="text-gray-500">SAR</span>}
              />
              <Input
                label={t('paidAmount')}
                type="number"
                value={formData.paidAmount || ''}
                onChange={(e) => handleChange('paidAmount', parseFloat(e.target.value) || 0)}
                error={errors.paidAmount}
                leftIcon={<span className="text-gray-500">SAR</span>}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dueAmount')}</label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-xl font-bold text-right">
                  {formatCurrency(calculatedDue)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {t('paymentStatus')}: <span className={`font-medium ${
                    calculatedPaymentStatus === 'paid' ? 'text-green-600' :
                    calculatedPaymentStatus === 'partial' ? 'text-orange-600' : 'text-red-600'
                  }`}>{t(calculatedPaymentStatus)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('serviceDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transaction.details && Object.entries(transaction.details).map(([key, value]) => {
                if (!value || key === 'notes') return null;
                return (
                  <Input
                    key={key}
                    label={t(key) || key}
                    value={String(value)}
                    onChange={(e) => handleDetailChange(key, e.target.value)}
                    disabled={key === 'ticketNumber' || key === 'pnr'}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('addNotesPlaceholder')}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate(`/transaction/${transaction.id}`)}>
            {t('cancel')}
          </Button>
          <Button type="submit">
            {t('saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
};
