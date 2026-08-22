import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore, useBranchStore, useTransactionStore, useCustomerStore } from '@/store';
import { dataProvider } from '@/api/dataProvider';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { Branch } from '@/types';

export const Branches: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { branches, fetchBranches, addBranch, updateBranch, deleteBranch } = useBranchStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { customers, fetchCustomers } = useCustomerStore();

  // Fetch data on mount
  useEffect(() => {
    fetchBranches();
    fetchTransactions();
    fetchCustomers();
  }, [fetchBranches, fetchTransactions, fetchCustomers]);

  const isSuperAdmin = user?.role === 'super_admin';

  // Access check for non-super-admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('accessDenied')}</h2>
          <p className="text-gray-500">{t('onlySuperAdminCanAccess')}</p>
          <Button className="mt-4" onClick={() => navigate('/')}>{t('backToDashboard')}</Button>
        </div>
      </div>
    );
  }

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    managerName: '',
    managerPhone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get branch stats
  const getBranchStats = (branchId: string) => {
    const branchTransactions = transactions.filter(t => t.branchId === branchId);
    const branchCustomers = customers.filter(c => c.branchId === branchId);
    return {
      transactions: branchTransactions.length,
      revenue: branchTransactions.reduce((sum, t) => sum + t.amount, 0),
      collected: branchTransactions.reduce((sum, t) => sum + t.paidAmount, 0),
      customers: branchCustomers.length,
    };
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('required');
    if (!formData.code.trim()) newErrors.code = t('required');
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      phone: '',
      email: '',
      address: '',
      managerName: '',
      managerPhone: '',
    });
    setErrors({});
  };

  // Handle add
  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      const newBranch = await dataProvider.branches.create({
        name: formData.name,
        code: formData.code,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        manager: formData.managerName || undefined,
        isActive: true,
      });
      addBranch(newBranch);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  };

  // Handle edit
  const handleEdit = async () => {
    if (!selectedBranch || !validateForm()) return;
    try {
      const updatedBranch = await dataProvider.branches.update(selectedBranch.id, {
        name: formData.name,
        code: formData.code,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        manager: formData.managerName || undefined,
      });
      updateBranch(selectedBranch.id, updatedBranch);
      setShowEditModal(false);
      setSelectedBranch(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update branch:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedBranch) {
      try {
        await deleteBranch(selectedBranch.id);
        setShowDeleteModal(false);
        setSelectedBranch(null);
      } catch (error) {
        console.error('Failed to delete branch:', error);
      }
    }
  };

  // Open edit modal
  const openEditModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
      managerName: (branch as any).managerName || '',
      managerPhone: (branch as any).managerPhone || '',
    });
    setShowEditModal(true);
  };

  // Total stats
  const totalStats = {
    branches: branches.length,
    transactions: transactions.length,
    revenue: transactions.reduce((sum, t) => sum + t.amount, 0),
    customers: customers.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('branches')}</h1>
          <p className="text-gray-600 mt-1">{t('manageYourBranches')}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('addBranch')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">{t('totalBranches')}</p>
          <p className="text-2xl font-bold text-gray-900">{totalStats.branches}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">{t('totalTransactions')}</p>
          <p className="text-2xl font-bold text-blue-700">{totalStats.transactions}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">{t('totalRevenue')}</p>
          <p className="text-2xl font-bold text-green-700">{totalStats.revenue.toLocaleString()} SAR</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">{t('totalCustomers')}</p>
          <p className="text-2xl font-bold text-purple-700">{totalStats.customers}</p>
        </div>
      </div>

      {/* Branches Grid */}
      {branches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => {
            const stats = getBranchStats(branch.id);
            return (
              <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                      <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded mt-1">
                        {branch.code}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (branch.status || (branch as any).isActive ? 'active' : 'inactive') === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t((branch.status || (branch as any).isActive ? 'active' : 'inactive'))}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    {branch.phone && (
                      <p className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {branch.phone}
                      </p>
                    )}
                    {branch.email && (
                      <p className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {branch.email}
                      </p>
                    )}
                    {branch.address && (
                      <p className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {branch.address}
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{stats.transactions}</p>
                        <p className="text-xs text-gray-500">{t('transactions')}</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{stats.customers}</p>
                        <p className="text-xs text-gray-500">{t('customers')}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xl font-bold text-green-600">{stats.revenue.toLocaleString()} SAR</p>
                        <p className="text-xs text-gray-500">{t('totalRevenue')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditModal(branch)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {t('edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        setSelectedBranch(branch);
                        setShowDeleteModal(true);
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noBranches')}</h3>
            <p className="text-gray-500 mb-4">{t('noBranchesDesc')}</p>
            <Button onClick={() => setShowAddModal(true)}>{t('addFirstBranch')}</Button>
          </CardContent>
        </Card>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('addBranch')}</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label={t('branchName')}
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                error={errors.name}
                required
              />
              <Input
                label={t('branchCode')}
                value={formData.code}
                onChange={(e) => { setFormData({ ...formData, code: e.target.value.toUpperCase() }); setErrors({ ...errors, code: '' }); }}
                error={errors.code}
                placeholder="e.g., DHA, JED, RIY"
                required
              />
              <Input
                label={t('phone')}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label={t('email')}
                type="email"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                error={errors.email}
              />
              <Input
                label={t('address')}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('managerName')}
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                />
                <Input
                  label={t('managerPhone')}
                  type="tel"
                  value={formData.managerPhone}
                  onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                {t('cancel')}
              </Button>
              <Button onClick={handleAdd}>{t('save')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('editBranch')}</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedBranch(null); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label={t('branchName')}
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                error={errors.name}
                required
              />
              <Input
                label={t('branchCode')}
                value={formData.code}
                onChange={(e) => { setFormData({ ...formData, code: e.target.value.toUpperCase() }); setErrors({ ...errors, code: '' }); }}
                error={errors.code}
                required
              />
              <Input
                label={t('phone')}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label={t('email')}
                type="email"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                error={errors.email}
              />
              <Input
                label={t('address')}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('managerName')}
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                />
                <Input
                  label={t('managerPhone')}
                  type="tel"
                  value={formData.managerPhone}
                  onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowEditModal(false); setSelectedBranch(null); resetForm(); }}>
                {t('cancel')}
              </Button>
              <Button onClick={handleEdit}>{t('save')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t('deleteBranch')}</h3>
                <p className="text-sm text-gray-500">{t('deleteBranchConfirm')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-medium text-gray-900">{selectedBranch.name}</p>
              <p className="text-sm text-gray-500">{selectedBranch.code}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedBranch(null); }}>
                {t('cancel')}
              </Button>
              <Button variant="danger" onClick={handleDelete}>{t('delete')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
