import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore, useCustomerStore, useTransactionStore, useBranchStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { Customer } from '@/types';

export const CustomerDetails: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { customers, updateCustomer } = useCustomerStore();
  const { transactions } = useTransactionStore();
  const { branches } = useBranchStore();

  const isSuperAdmin = user?.role === 'super_admin';

  // Find customer by ID
  const customer = useMemo(() => {
    return customers.find(c => c.id === id);
  }, [customers, id]);

  // Customer transactions
  const customerTransactions = useMemo(() => {
    if (!customer) return [];
    return transactions.filter(t => t.customerId === customer.id);
  }, [transactions, customer]);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'transactions' | 'notes'>('info');

  // Initialize form data when customer changes
  React.useEffect(() => {
    if (customer && !isEditing) {
      setFormData(customer);
    }
  }, [customer, isEditing]);

  // Start editing
  const handleStartEdit = () => {
    if (customer) {
      setFormData({ ...customer });
      setIsEditing(true);
    }
  };

  // Handle field change
  const handleChange = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = t('required');
    if (!formData.phone?.trim()) newErrors.phone = t('required');
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save customer
  const handleSave = () => {
    if (!validateForm() || !customer) return;
    updateCustomer(customer.id, formData);
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData(customer || {});
    setIsEditing(false);
    setErrors({});
  };

  // Get status badge color
  const getStatusBadge = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">{t('expired')}</span>;
    } else if (daysUntilExpiry <= 30) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">{t('expiringSoon')}</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">{t('valid')}</span>;
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  if (!customer) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('customerDetails')}</h1>
          <Button variant="outline" onClick={() => navigate('/customers')}>
            {t('back')}
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('customerNotFound')}</h2>
            <p className="text-gray-500">{t('customerNotFoundDesc')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('customerDetails')}</h1>
            <p className="text-gray-600">{customer.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>{t('cancel')}</Button>
              <Button onClick={handleSave}>{t('saveChanges')}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleStartEdit}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {t('edit')}
              </Button>
              <Button onClick={() => navigate(`/services?customerId=${customer.id}`)}>
                {t('newTransaction')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="text-center py-4">
            <p className="text-3xl font-bold">{customer.totalTransactions}</p>
            <p className="text-sm opacity-90">{t('totalTransactions')}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="text-center py-4">
            <p className="text-3xl font-bold">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-sm opacity-90">{t('totalSpent')}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="text-center py-4">
            <p className="text-3xl font-bold">{customerTransactions.length}</p>
            <p className="text-sm opacity-90">{t('activeServices')}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="text-center py-4">
            <p className="text-3xl font-bold">{formatDate(customer.lastVisit)}</p>
            <p className="text-sm opacity-90">{t('lastVisit')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['info', 'documents', 'transactions', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t(tab === 'info' ? 'basicInfo' : tab === 'documents' ? 'documents' : tab === 'transactions' ? 'transactions' : 'notes')}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('personalInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label={t('customerName')}
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                  error={errors.name}
                />
                <Input
                  label={t('customerNameAr')}
                  value={formData.nameAr || ''}
                  onChange={(e) => handleChange('nameAr', e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('optional')}
                />
                <Input
                  label={t('phoneNumber')}
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                  error={errors.phone}
                />
                <Input
                  label={t('email')}
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                  error={errors.email}
                />
                <Input
                  label={t('nationality')}
                  value={formData.nationality || ''}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  disabled={!isEditing}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('branch')}</label>
                  <select
                    value={formData.branchId || ''}
                    onChange={(e) => handleChange('branchId', e.target.value)}
                    disabled={!isEditing || !isSuperAdmin}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('contactInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerAddress')}</label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                  />
                </div>
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{t('accountInfo')}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">{t('customerId')}</p>
                      <p className="font-medium">{customer.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('createdAt')}</p>
                      <p className="font-medium">{formatDate(customer.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('updatedAt')}</p>
                      <p className="font-medium">{formatDate(customer.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('passportInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label={t('passportNumber')}
                  value={formData.passportNumber || ''}
                  onChange={(e) => handleChange('passportNumber', e.target.value)}
                  disabled={!isEditing}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('passportExpiry')}</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="date"
                      value={formData.passportExpiry || ''}
                      onChange={(e) => handleChange('passportExpiry', e.target.value)}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                    {getStatusBadge(formData.passportExpiry)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('iqamaInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label={t('iqamaNumber')}
                  value={formData.iqamaNumber || ''}
                  onChange={(e) => handleChange('iqamaNumber', e.target.value)}
                  disabled={!isEditing}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('iqamaExpiry')}</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="date"
                      value={formData.iqamaExpiry || ''}
                      onChange={(e) => handleChange('iqamaExpiry', e.target.value)}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                    {getStatusBadge(formData.iqamaExpiry)}
                  </div>
                </div>
                <Input
                  label={t('profession')}
                  value={formData.profession || ''}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  disabled={!isEditing}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('transactionHistory')}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate(`/services?customerId=${customer.id}`)}>
                + {t('newTransaction')}
              </Button>
            </CardHeader>
            <CardContent>
              {customerTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500">{t('noTransactions')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('date')}</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('service')}</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('status')}</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('amount')}</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('paid')}</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('due')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerTransactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">{formatDate(txn.createdAt)}</td>
                          <td className="py-3 px-4 text-sm">
                            <div>
                              <p className="font-medium">{txn.serviceName}</p>
                              <p className="text-gray-500 text-xs">{txn.id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                              txn.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              txn.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {t(txn.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-sm">{formatCurrency(txn.amount)}</td>
                          <td className="py-3 px-4 text-right text-sm text-green-600">{formatCurrency(txn.paidAmount)}</td>
                          <td className="py-3 px-4 text-right text-sm text-red-600">{formatCurrency(txn.dueAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('customerNotes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.nameAr || ''} // Using nameAr as notes for now
                onChange={(e) => handleChange('nameAr', e.target.value)}
                disabled={!isEditing}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                placeholder={t('addNotesPlaceholder')}
              />
              {!isEditing && (
                <p className="mt-2 text-sm text-gray-500">{t('enableEditToAddNotes')}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
