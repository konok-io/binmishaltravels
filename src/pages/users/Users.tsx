import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore, useUserStore, useBranchStore } from '@/store';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { User, UserRole } from '@/types';

export const Users: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { users, addUser, updateUser, deleteUser } = useUserStore();
  const { branches } = useBranchStore();

  const isSuperAdmin = currentUser?.role === 'super_admin';

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'branch_staff' as UserRole,
    branchId: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter users
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesBranch = filterBranch === 'all' || user.branchId === filterBranch;

    return matchesSearch && matchesRole && matchesBranch;
  });

  // Stats
  const stats = {
    total: users.length,
    superAdmins: users.filter((u: User) => u.role === 'super_admin').length,
    managers: users.filter((u: User) => u.role === 'branch_manager').length,
    staff: users.filter((u: User) => u.role === 'branch_staff').length,
  };

  // Get branch name
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  // Get role badge color
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'branch_manager':
        return 'bg-blue-100 text-blue-800';
      case 'branch_staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Validate form
  const validateForm = (isEdit: boolean = false) => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('required');
    if (!formData.email.trim()) newErrors.email = t('required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail');
    }
    if (!isEdit) {
      if (!formData.password) newErrors.password = t('required');
      if (formData.password.length < 6) newErrors.password = t('passwordMinLength');
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('passwordMismatch');
      }
    }
    if (formData.role !== 'super_admin' && !formData.branchId) {
      newErrors.branchId = t('required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'branch_staff',
      branchId: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  // Handle add
  const handleAdd = () => {
    if (!validateForm()) return;
    const newUser: User = {
      id: `USR-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      role: formData.role,
      branchId: formData.role === 'super_admin' ? '' : formData.branchId,
      branchName: formData.role === 'super_admin' ? '' : getBranchName(formData.branchId),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    addUser(newUser, formData.password);
    setShowAddModal(false);
    resetForm();
  };

  // Handle edit
  const handleEdit = () => {
    if (!selectedUser || !validateForm(true)) return;
    updateUser(selectedUser.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      role: formData.role,
      branchId: formData.role === 'super_admin' ? '' : formData.branchId,
      branchName: formData.role === 'super_admin' ? '' : getBranchName(formData.branchId),
    });
    if (formData.password) {
      // Password update would go here in a real app
    }
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      branchId: user.branchId || '',
      password: '',
      confirmPassword: '',
    });
    setShowEditModal(true);
  };

  // Toggle user active status
  const toggleUserStatus = (user: User) => {
    updateUser(user.id, { isActive: !user.isActive });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('users')}</h1>
          <p className="text-gray-600 mt-1">{t('manageYourUsers')}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('addUser')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">{t('total')}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">{t('superAdmin')}</p>
          <p className="text-2xl font-bold text-purple-700">{stats.superAdmins}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">{t('branchManager')}</p>
          <p className="text-2xl font-bold text-blue-700">{stats.managers}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">{t('branchStaff')}</p>
          <p className="text-2xl font-bold text-green-700">{stats.staff}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder={t('searchUser')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('allRoles')}</option>
              <option value="super_admin">{t('superAdmin')}</option>
              <option value="branch_manager">{t('branchManager')}</option>
              <option value="branch_staff">{t('branchStaff')}</option>
            </select>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('allBranches')}</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('user')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('userRole')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('branch')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <span className="text-primary-700 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-500">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role)}`}>
                          {user.role === 'super_admin' ? t('superAdmin') :
                           user.role === 'branch_manager' ? t('branchManager') :
                           t('branchStaff')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.branchName || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {user.isActive ? t('active') : t('inactive')}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title={t('edit')}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-red-600 hover:text-red-800"
                              title={t('delete')}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noUsers')}</h3>
              <p className="text-gray-500 mb-4">{t('noUsersDesc')}</p>
              <Button onClick={() => setShowAddModal(true)}>{t('addFirstUser')}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('addUser')}</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label={t('userName')}
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                error={errors.name}
                required
              />
              <Input
                label={t('email')}
                type="email"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                error={errors.email}
                required
              />
              <Input
                label={t('phone')}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('userRole')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="branch_staff">{t('branchStaff')}</option>
                  <option value="branch_manager">{t('branchManager')}</option>
                  <option value="super_admin">{t('superAdmin')}</option>
                </select>
              </div>

              {formData.role !== 'super_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('branch')}</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => { setFormData({ ...formData, branchId: e.target.value }); setErrors({ ...errors, branchId: '' }); }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.branchId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">{t('selectBranch')}...</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                  {errors.branchId && <p className="mt-1 text-sm text-red-600">{errors.branchId}</p>}
                </div>
              )}

              <Input
                label={t('password')}
                type="password"
                value={formData.password}
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                error={errors.password}
                required
              />
              <Input
                label={t('confirmPassword')}
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }); }}
                error={errors.confirmPassword}
                required
              />
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
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('editUser')}</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedUser(null); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label={t('userName')}
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                error={errors.name}
                required
              />
              <Input
                label={t('email')}
                type="email"
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                error={errors.email}
                required
              />
              <Input
                label={t('phone')}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('userRole')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="branch_staff">{t('branchStaff')}</option>
                  <option value="branch_manager">{t('branchManager')}</option>
                  <option value="super_admin">{t('superAdmin')}</option>
                </select>
              </div>

              {formData.role !== 'super_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('branch')}</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => { setFormData({ ...formData, branchId: e.target.value }); setErrors({ ...errors, branchId: '' }); }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.branchId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">{t('selectBranch')}...</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                  {errors.branchId && <p className="mt-1 text-sm text-red-600">{errors.branchId}</p>}
                </div>
              )}

              <Input
                label={t('newPassword') + ' (' + t('optional') + ')'}
                type="password"
                value={formData.password}
                onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                error={errors.password}
              />
              {formData.password && (
                <Input
                  label={t('confirmPassword')}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }); }}
                  error={errors.confirmPassword}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowEditModal(false); setSelectedUser(null); resetForm(); }}>
                {t('cancel')}
              </Button>
              <Button onClick={handleEdit}>{t('save')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t('deleteUser')}</h3>
                <p className="text-sm text-gray-500">{t('deleteUserConfirm')}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-medium text-gray-900">{selectedUser.name}</p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}>
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
