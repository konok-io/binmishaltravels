import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore, useCustomerStore, useBranchStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { Customer } from '@/types';

export const AddCustomer: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, currentBranch } = useAuthStore();
  const { addCustomer } = useCustomerStore();
  const { branches } = useBranchStore();

  const isSuperAdmin = user?.role === 'super_admin';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    iqamaNumber: '',
    iqamaExpiry: '',
    profession: '',
  });

  const [selectedBranchId, setSelectedBranchId] = useState(
    isSuperAdmin ? '' : (user?.branchId || '')
  );

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('required');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('required');
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }
    if (isSuperAdmin && !selectedBranchId) {
      newErrors.branch = t('required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const branch = branches.find(b => b.id === (selectedBranchId || user?.branchId));
    const branchName = branch?.name || currentBranch?.name || '';

    const customer: Customer = {
      id: `C-${Date.now()}`,
      branchId: selectedBranchId || user?.branchId || '',
      branchName: branchName,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      nationality: formData.nationality || undefined,
      passportNumber: formData.passportNumber || undefined,
      passportExpiry: formData.passportExpiry || undefined,
      iqamaNumber: formData.iqamaNumber || undefined,
      iqamaExpiry: formData.iqamaExpiry || undefined,
      profession: formData.profession || undefined,
      totalTransactions: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addCustomer(customer);
    navigate('/customers');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('addCustomer')}</h1>
          <p className="text-gray-600 mt-1">{t('addNewCustomerDesc')}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/customers')}>
          {t('back')}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t('customerInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('customerName')}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                required
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <Input
                label={t('customerPhone')}
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                required
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />
              <Input
                label={t('customerEmail')}
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              <Input
                label={t('nationality')}
                value={formData.nationality}
                onChange={(e) => handleChange('nationality', e.target.value)}
                placeholder="e.g., Bangladeshi, Saudi"
              />
            </div>

            <Input
              label={t('customerAddress')}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          </CardContent>
        </Card>

        {/* Branch Selection */}
        {isSuperAdmin && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('branch')}</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  if (errors.branch) setErrors(prev => ({ ...prev, branch: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.branch ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">{t('selectBranch')}...</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
              {errors.branch && (
                <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Passport & Iqama */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('passportInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('passportNumber')}
                value={formData.passportNumber}
                onChange={(e) => handleChange('passportNumber', e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                }
              />
              <Input
                label={t('passportExpiry')}
                type="date"
                value={formData.passportExpiry}
                onChange={(e) => handleChange('passportExpiry', e.target.value)}
              />
              <Input
                label={t('iqamaNumber')}
                value={formData.iqamaNumber}
                onChange={(e) => handleChange('iqamaNumber', e.target.value)}
              />
              <Input
                label={t('iqamaExpiry')}
                type="date"
                value={formData.iqamaExpiry}
                onChange={(e) => handleChange('iqamaExpiry', e.target.value)}
              />
              <Input
                label={t('profession')}
                value={formData.profession}
                onChange={(e) => handleChange('profession', e.target.value)}
                className="md:col-span-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate('/customers')}>
            {t('cancel')}
          </Button>
          <Button type="submit">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('saveCustomer')}
          </Button>
        </div>
      </form>
    </div>
  );
};
