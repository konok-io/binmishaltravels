import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore, useTransactionStore, useServiceStore, useCustomerStore, useBranchStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { ServiceCategory, Service, Customer, ServiceDetails } from '@/types';

export const NewTransaction: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, currentBranch } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  const { getServicesByCategory } = useServiceStore();
  const { addCustomer, searchCustomers } = useCustomerStore();
  const { branches } = useBranchStore();

  const isSuperAdmin = user?.role === 'super_admin';
  const initialServiceType = searchParams.get('type') as ServiceCategory | null;

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceCategory | ''>(
    initialServiceType || ''
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Customer states
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    passportNumber: '',
    iqamaNumber: '',
    nationality: '',
    address: '',
  });

  // Transaction details
  const [transactionDetails, setTransactionDetails] = useState<ServiceDetails>({});
  
  // Payment states
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Branch selection
  const [selectedBranchId, setSelectedBranchId] = useState(
    isSuperAdmin ? '' : (user?.branchId || '')
  );

  // Service types
  const serviceTypes = useMemo(() => {
    const categories: { code: ServiceCategory; name: string; icon: string }[] = [
      { code: 'air_ticket', name: t('airTicket'), icon: '✈️' },
      { code: 'cargo', name: t('cargo'), icon: '📦' },
      { code: 'iqama', name: t('iqama'), icon: '🪪' },
      { code: 'visa', name: t('visa'), icon: '📋' },
      { code: 'passport', name: t('passport'), icon: '📘' },
      { code: 'jawazat', name: t('jawazat'), icon: '🏛️' },
      { code: 'airport_print', name: t('airportPrint'), icon: '🖨️' },
      { code: 'umrah', name: t('umrah'), icon: '🕋' },
    ];
    return categories;
  }, [t]);

  // Filtered services by type
  const filteredServices = useMemo(() => {
    if (!selectedServiceType) return [];
    return getServicesByCategory(selectedServiceType);
  }, [selectedServiceType, getServicesByCategory]);

  // Search customers
  const searchResults = useMemo(() => {
    if (!customerSearch || customerSearch.length < 2) return [];
    return searchCustomers(customerSearch, isSuperAdmin ? selectedBranchId || undefined : user?.branchId);
  }, [customerSearch, searchCustomers, isSuperAdmin, selectedBranchId, user?.branchId]);

  // Calculate due amount
  const dueAmount = useMemo(() => {
    const total = parseFloat(amount) || 0;
    const paid = parseFloat(paidAmount) || 0;
    return Math.max(0, total - paid);
  }, [amount, paidAmount]);

  // Update details handler
  const updateDetail = (key: keyof ServiceDetails, value: string | number | undefined) => {
    setTransactionDetails(prev => ({ ...prev, [key]: value }));
  };

  // Handle service selection
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setTransactionDetails({});
  };

  // Handle new customer creation
  const handleCreateCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    
    const customer: Customer = {
      id: `C-${Date.now()}`,
      branchId: selectedBranchId || user?.branchId || '',
      branchName: branches.find(b => b.id === selectedBranchId)?.name || currentBranch?.name || '',
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      passportNumber: newCustomer.passportNumber,
      iqamaNumber: newCustomer.iqamaNumber,
      nationality: newCustomer.nationality,
      address: newCustomer.address,
      totalTransactions: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addCustomer(customer);
    setSelectedCustomer(customer);
    setShowNewCustomer(false);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      passportNumber: '',
      iqamaNumber: '',
      nationality: '',
      address: '',
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedService || !selectedCustomer || !amount) return;

    const branch = branches.find(b => b.id === (selectedBranchId || user?.branchId));
    
    const transaction = {
      id: `TXN-${Date.now()}`,
      branchId: selectedBranchId || user?.branchId || '',
      branchName: branch?.name || currentBranch?.name || '',
      serviceId: selectedService.id,
      serviceCode: selectedService.code,
      serviceName: selectedService.name,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerPassport: selectedCustomer.passportNumber,
      details: transactionDetails,
      status: 'pending' as const,
      amount: parseFloat(amount),
      paidAmount: parseFloat(paidAmount) || 0,
      dueAmount: dueAmount,
      paymentStatus: dueAmount === 0 ? 'paid' as const : dueAmount < parseFloat(amount) ? 'partial' as const : 'due' as const,
      staffId: user?.id || '',
      staffName: user?.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
      offlineId: `OFF-${Date.now()}`,
      isSynced: true,
    };

    addTransaction(transaction);
    navigate('/transactions');
  };

  // Render service-specific form
  const renderServiceForm = () => {
    if (!selectedService) return null;

    switch (selectedServiceType) {
      case 'air_ticket':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('passengerName')}
              value={transactionDetails.passengerName || ''}
              onChange={(e) => updateDetail('passengerName', e.target.value)}
              required
            />
            <Input
              label={t('route')}
              value={transactionDetails.route || ''}
              onChange={(e) => updateDetail('route', e.target.value)}
              placeholder="DAC-JED"
            />
            <Input
              label={t('airline')}
              value={transactionDetails.airline || ''}
              onChange={(e) => updateDetail('airline', e.target.value)}
            />
            <Input
              label={t('flightDate')}
              type="date"
              value={transactionDetails.flightDate || ''}
              onChange={(e) => updateDetail('flightDate', e.target.value)}
            />
            <Input
              label={t('returnDate')}
              type="date"
              value={transactionDetails.returnDate || ''}
              onChange={(e) => updateDetail('returnDate', e.target.value)}
            />
            <Input
              label={t('ticketNumber')}
              value={transactionDetails.ticketNumber || ''}
              onChange={(e) => updateDetail('ticketNumber', e.target.value)}
            />
            <Input
              label={t('pnr')}
              value={transactionDetails.pnr || ''}
              onChange={(e) => updateDetail('pnr', e.target.value)}
              placeholder="ABC123"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('seatClass')}</label>
              <select
                value={transactionDetails.seatClass || ''}
                onChange={(e) => updateDetail('seatClass', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('select')}...</option>
                <option value="economy">{t('economy')}</option>
                <option value="business">{t('business')}</option>
                <option value="first">{t('firstClass')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengerType')}</label>
              <select
                value={transactionDetails.passengerType || ''}
                onChange={(e) => updateDetail('passengerType', e.target.value as 'adult' | 'child' | 'infant')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('select')}...</option>
                <option value="adult">{t('adult')}</option>
                <option value="child">{t('child')}</option>
                <option value="infant">{t('infant')}</option>
              </select>
            </div>
          </div>
        );

      case 'cargo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('weight')}</label>
              <div className="relative">
                <input
                  type="number"
                  value={transactionDetails.weight || ''}
                  onChange={(e) => updateDetail('weight', parseFloat(e.target.value) || undefined)}
                  placeholder="23"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pr-12"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">
                  KG
                </span>
              </div>
            </div>
            <Input
              label={t('cargoType')}
              value={transactionDetails.cargoType || ''}
              onChange={(e) => updateDetail('cargoType', e.target.value)}
            />
            <Input
              label={t('origin')}
              value={transactionDetails.origin || ''}
              onChange={(e) => updateDetail('origin', e.target.value)}
            />
            <Input
              label={t('destination')}
              value={transactionDetails.destination || ''}
              onChange={(e) => updateDetail('destination', e.target.value)}
            />
            <Input
              label={t('trackingNumber')}
              value={transactionDetails.trackingNumber || ''}
              onChange={(e) => updateDetail('trackingNumber', e.target.value)}
            />
          </div>
        );

      case 'iqama':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('iqamaNumber')}
              value={transactionDetails.iqamaNumber || ''}
              onChange={(e) => updateDetail('iqamaNumber', e.target.value)}
            />
            <Input
              label={t('profession')}
              value={transactionDetails.profession || ''}
              onChange={(e) => updateDetail('profession', e.target.value)}
            />
            <Input
              label={t('sponsorName')}
              value={transactionDetails.sponsorName || ''}
              onChange={(e) => updateDetail('sponsorName', e.target.value)}
            />
            <Input
              label={t('expiryDate')}
              type="date"
              value={transactionDetails.expiryDate || ''}
              onChange={(e) => updateDetail('expiryDate', e.target.value)}
            />
            <Input
              label={t('renewalStatus')}
              value={transactionDetails.renewalStatus || ''}
              onChange={(e) => updateDetail('renewalStatus', e.target.value)}
            />
          </div>
        );

      case 'visa':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('visaType')}
              value={transactionDetails.visaType || ''}
              onChange={(e) => updateDetail('visaType', e.target.value)}
            />
            <Input
              label={t('visaDuration')}
              value={transactionDetails.visaDuration || ''}
              onChange={(e) => updateDetail('visaDuration', e.target.value)}
            />
            <Input
              label={t('entryDate')}
              type="date"
              value={transactionDetails.entryDate || ''}
              onChange={(e) => updateDetail('entryDate', e.target.value)}
            />
            <Input
              label={t('exitDate')}
              type="date"
              value={transactionDetails.exitDate || ''}
              onChange={(e) => updateDetail('exitDate', e.target.value)}
            />
            <Input
              label={t('visaNumber')}
              value={transactionDetails.visaNumber || ''}
              onChange={(e) => updateDetail('visaNumber', e.target.value)}
            />
          </div>
        );

      case 'passport':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('passportNumber')}
              value={transactionDetails.referenceNumber || ''}
              onChange={(e) => updateDetail('referenceNumber', e.target.value)}
            />
          </div>
        );

      case 'jawazat':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('jawazatType')}
              value={transactionDetails.jawazatType || ''}
              onChange={(e) => updateDetail('jawazatType', e.target.value)}
            />
            <Input
              label={t('printCount')}
              type="number"
              value={transactionDetails.printCount || ''}
              onChange={(e) => updateDetail('printCount', parseInt(e.target.value) || undefined)}
            />
          </div>
        );

      case 'umrah':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('umrahPackage')}
              value={transactionDetails.umrahPackage || ''}
              onChange={(e) => updateDetail('umrahPackage', e.target.value)}
            />
            <Input
              label={t('visaValidity')}
              type="date"
              value={transactionDetails.visaValidity || ''}
              onChange={(e) => updateDetail('visaValidity', e.target.value)}
            />
            <Input
              label={t('hotelName')}
              value={transactionDetails.hotelName || ''}
              onChange={(e) => updateDetail('hotelName', e.target.value)}
            />
          </div>
        );

      case 'airport_print':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('referenceNumber')}
              value={transactionDetails.referenceNumber || ''}
              onChange={(e) => updateDetail('referenceNumber', e.target.value)}
            />
            <Input
              label={t('notes')}
              value={transactionDetails.notes || ''}
              onChange={(e) => updateDetail('notes', e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('newTransaction')}</h1>
          <p className="text-gray-600 mt-1">{t('createNewTransaction')}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/transactions')}>
          {t('back')}
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                currentStep >= step
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-20 h-1 mx-2 ${
                  currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-8 text-sm">
        <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}>
          {t('selectService')}
        </span>
        <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}>
          {t('customerInfo')}
        </span>
        <span className={currentStep >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}>
          {t('paymentInfo')}
        </span>
      </div>

      {/* Step 1: Service Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('selectService')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Type Selection */}
            {!selectedServiceType && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('serviceCategory')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {serviceTypes.map((type) => (
                    <button
                      key={type.code}
                      onClick={() => setSelectedServiceType(type.code)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
                    >
                      <span className="text-3xl mb-2 block">{type.icon}</span>
                      <span className="text-sm font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Service Selection */}
            {selectedServiceType && !selectedService && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {serviceTypes.find(s => s.code === selectedServiceType)?.name} - {t('selectService')}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedServiceType('');
                      setSelectedService(null);
                    }}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    {t('change')} {t('serviceCategory')}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                    >
                      <span className="text-2xl mb-2 block">{service.icon}</span>
                      <span className="font-medium">{service.name}</span>
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Service Form */}
            {selectedService && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{selectedService.icon}</span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedService.name}</h3>
                      <p className="text-sm text-gray-500">{selectedService.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-sm text-primary-600 hover:underline"
                  >
                    {t('change')}
                  </button>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">{t('serviceDetails')}</h4>
                  {renderServiceForm()}
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setCurrentStep(2)}>
                    {t('next')}: {t('customerInfo')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Customer Info */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('customerInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Branch Selection for Super Admin */}
            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectBranch')}</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setSelectedCustomer(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">{t('selectBranch')}...</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer Selection */}
            {!showNewCustomer && (
              <div className="space-y-4">
                <Input
                  label={t('searchCustomer')}
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder={t('searchByCustomer')}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                    {searchResults.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch('');
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Customer */}
                {selectedCustomer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">{selectedCustomer.name}</p>
                        <p className="text-sm text-green-600">{selectedCustomer.phone}</p>
                        {selectedCustomer.passportNumber && (
                          <p className="text-sm text-green-600">{t('passport')}: {selectedCustomer.passportNumber}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedCustomer(null)}
                        className="text-sm text-green-700 hover:underline"
                      >
                        {t('change')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Add New Customer Button */}
                <div className="pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowNewCustomer(true)}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('addNewCustomer')}
                  </Button>
                </div>
              </div>
            )}

            {/* New Customer Form */}
            {showNewCustomer && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">{t('addNewCustomer')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('customerName')}
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    label={t('customerPhone')}
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                  <Input
                    label={t('customerEmail')}
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    label={t('passportNumber')}
                    value={newCustomer.passportNumber}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, passportNumber: e.target.value }))}
                  />
                  <Input
                    label={t('iqamaNumber')}
                    value={newCustomer.iqamaNumber}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, iqamaNumber: e.target.value }))}
                  />
                  <Input
                    label={t('nationality')}
                    value={newCustomer.nationality}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, nationality: e.target.value }))}
                  />
                </div>
                <Input
                  label={t('customerAddress')}
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                />
                <div className="flex gap-3">
                  <Button onClick={handleCreateCustomer} disabled={!newCustomer.name || !newCustomer.phone}>
                    {t('saveCustomer')}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewCustomer(false)}>
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                {t('previous')}
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!selectedCustomer || !selectedBranchId && isSuperAdmin}
              >
                {t('next')}: {t('paymentInfo')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment Info */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('paymentInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{t('transactionSummary')}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">{t('service')}:</p>
                <p className="font-medium">{selectedService?.name}</p>
                <p className="text-gray-600">{t('customer')}:</p>
                <p className="font-medium">{selectedCustomer?.name}</p>
                <p className="text-gray-600">{t('branch')}:</p>
                <p className="font-medium">
                  {branches.find(b => b.id === (selectedBranchId || user?.branchId))?.name || currentBranch?.name}
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('totalAmount')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pr-14"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">
                    SAR
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('paidAmount')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pr-14"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">
                    SAR
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('dueAmount')}</label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-lg font-bold text-red-600">
                  {dueAmount.toLocaleString()} SAR
                </div>
              </div>
            </div>

            <Input
              label={t('notes')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('addNotes')}
            />

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                {t('previous')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                {t('createTransaction')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
