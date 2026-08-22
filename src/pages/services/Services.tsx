import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useAuthStore, useTransactionStore, useCustomerStore, useBranchStore, useServiceStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { ServiceCategory, Customer, ServiceDetails, Service } from '@/types';

// Service type definitions
const SERVICE_TYPES = [
  { code: 'air_ticket' as ServiceCategory, icon: '✈️', color: 'bg-blue-100 text-blue-700' },
  { code: 'visa' as ServiceCategory, icon: '📋', color: 'bg-green-100 text-green-700' },
  { code: 'iqama' as ServiceCategory, icon: '🪪', color: 'bg-purple-100 text-purple-700' },
  { code: 'cargo' as ServiceCategory, icon: '📦', color: 'bg-orange-100 text-orange-700' },
  { code: 'umrah' as ServiceCategory, icon: '🕋', color: 'bg-teal-100 text-teal-700' },
];

export const Services: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addTransaction } = useTransactionStore();
  const { addCustomer, searchCustomers } = useCustomerStore();
  const { branches } = useBranchStore();
  const { services, addService, fetchServices } = useServiceStore();

  const isSuperAdmin = user?.role === 'super_admin';

  // Fetch services from API on mount
  React.useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Tab state: 'transaction' or 'government'
  const [activeTab, setActiveTab] = useState<'transaction' | 'government'>('transaction');

  // Government services modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    icon: '🔗',
    description: '',
    link: '',
  });

  // Filter government services (services with links)
  const governmentServices = useMemo(() => {
    return services.filter(s => s.link);
  }, [services]);

  // Handle add new government service
  const handleAddGovernmentService = () => {
    if (!newService.name || !newService.link) return;

    const service: Service = {
      id: `GOV-${Date.now()}`,
      code: `gov_${Date.now()}`,
      name: newService.name,
      nameBn: newService.name,
      nameAr: newService.name,
      category: 'air_ticket',
      icon: newService.icon || '🔗',
      description: newService.description,
      link: newService.link,
      isActive: true,
    };

    addService(service);
    setShowAddModal(false);
    setNewService({ name: '', icon: '🔗', description: '', link: '' });
  };

  // Selected service type
  const [selectedType, setSelectedType] = useState<ServiceCategory>('air_ticket');
  
  // Selected government service (when clicking on a government service)
  const [selectedGovServiceId, setSelectedGovServiceId] = useState<string | null>(null);
  const selectedGovService = governmentServices.find(s => s.id === selectedGovServiceId);

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
  const [details, setDetails] = useState<ServiceDetails>({});

  // Payment states
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Branch selection
  const [selectedBranchId] = useState(
    isSuperAdmin ? '' : (user?.branchId || '')
  );

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

  // Update detail handler
  const updateDetail = (key: keyof ServiceDetails, value: string | number | undefined) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  // Handle new customer creation
  const handleCreateCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) return;

    const customer: Customer = {
      id: `C-${Date.now()}`,
      branchId: selectedBranchId || user?.branchId || '',
      branchName: branches.find(b => b.id === selectedBranchId)?.name || '',
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
    if (!selectedCustomer || !amount) return;

    const branch = branches.find(b => b.id === (selectedBranchId || user?.branchId));

    // Determine service info (government service or regular service)
    const serviceId = selectedGovService ? selectedGovService.id : `SVC-${selectedType}`;
    const serviceCode = selectedGovService ? selectedGovService.code : selectedType;
    const serviceName = selectedGovService ? selectedGovService.name : t(selectedType === 'air_ticket' ? 'airTicket' : selectedType);

    const transaction = {
      id: `TXN-${Date.now()}`,
      branchId: selectedBranchId || user?.branchId || '',
      branchName: branch?.name || '',
      serviceId: serviceId,
      serviceCode: serviceCode,
      serviceName: serviceName,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerPassport: selectedCustomer.passportNumber,
      details: { ...details, notes },
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

  // Get service name
  const getServiceName = (type: ServiceCategory) => {
    const names: Record<ServiceCategory, string> = {
      air_ticket: t('airTicket'),
      visa: t('visa'),
      iqama: t('iqama'),
      cargo: t('cargo'),
      umrah: t('umrah'),
      passport: t('passport'),
      jawazat: t('jawazat'),
      airport_print: t('airportPrint'),
    };
    return names[type] || type;
  };

  // Open government service link
  const openServiceLink = (link: string) => {
    if (link) {
      // Check if link has protocol, if not add https://
      const url = link.startsWith('http://') || link.startsWith('https://') 
        ? link 
        : `https://${link}`;
      window.open(url, '_blank');
    }
  };

  // Render service-specific form
  const renderServiceForm = () => {
    switch (selectedType) {
      case 'air_ticket':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('passengerName')}
              value={details.passengerName || ''}
              onChange={(e) => updateDetail('passengerName', e.target.value)}
              required
            />
            <Input
              label={t('route')}
              value={details.route || ''}
              onChange={(e) => updateDetail('route', e.target.value)}
              placeholder="DAC-JED"
            />
            <Input
              label={t('airline')}
              value={details.airline || ''}
              onChange={(e) => updateDetail('airline', e.target.value)}
            />
            <Input
              label={t('flightDate')}
              type="date"
              value={details.flightDate || ''}
              onChange={(e) => updateDetail('flightDate', e.target.value)}
            />
            <Input
              label={t('returnDate')}
              type="date"
              value={details.returnDate || ''}
              onChange={(e) => updateDetail('returnDate', e.target.value)}
            />
            <Input
              label={t('ticketNumber')}
              value={details.ticketNumber || ''}
              onChange={(e) => updateDetail('ticketNumber', e.target.value)}
            />
            <Input
              label={t('pnr')}
              value={details.pnr || ''}
              onChange={(e) => updateDetail('pnr', e.target.value)}
              placeholder="ABC123"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('seatClass')}</label>
              <select
                value={details.seatClass || ''}
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
                value={details.passengerType || ''}
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

      case 'visa':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('visaType')}
              value={details.visaType || ''}
              onChange={(e) => updateDetail('visaType', e.target.value)}
              placeholder={t('tourist') + ', ' + t('work') + ', ' + t('family')}
            />
            <Input
              label={t('visaDuration')}
              value={details.visaDuration || ''}
              onChange={(e) => updateDetail('visaDuration', e.target.value)}
              placeholder="3 months"
            />
            <Input
              label={t('entryDate')}
              type="date"
              value={details.entryDate || ''}
              onChange={(e) => updateDetail('entryDate', e.target.value)}
            />
            <Input
              label={t('exitDate')}
              type="date"
              value={details.exitDate || ''}
              onChange={(e) => updateDetail('exitDate', e.target.value)}
            />
            <Input
              label={t('visaNumber')}
              value={details.visaNumber || ''}
              onChange={(e) => updateDetail('visaNumber', e.target.value)}
            />
          </div>
        );

      case 'iqama':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('iqamaNumber')}
              value={details.iqamaNumber || ''}
              onChange={(e) => updateDetail('iqamaNumber', e.target.value)}
            />
            <Input
              label={t('profession')}
              value={details.profession || ''}
              onChange={(e) => updateDetail('profession', e.target.value)}
            />
            <Input
              label={t('sponsorName')}
              value={details.sponsorName || ''}
              onChange={(e) => updateDetail('sponsorName', e.target.value)}
            />
            <Input
              label={t('expiryDate')}
              type="date"
              value={details.expiryDate || ''}
              onChange={(e) => updateDetail('expiryDate', e.target.value)}
            />
            <Input
              label={t('renewalStatus')}
              value={details.renewalStatus || ''}
              onChange={(e) => updateDetail('renewalStatus', e.target.value)}
              placeholder={t('new') + ', ' + t('renewal')}
            />
          </div>
        );

      case 'cargo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('weight')}</label>
              <div className="relative">
                <input
                  type="number"
                  value={details.weight || ''}
                  onChange={(e) => updateDetail('weight', parseFloat(e.target.value) || undefined)}
                  placeholder="23"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-sm">
                  KG
                </span>
              </div>
            </div>
            <Input
              label={t('cargoType')}
              value={details.cargoType || ''}
              onChange={(e) => updateDetail('cargoType', e.target.value)}
              placeholder={t('documents') + ', ' + t('packages')}
            />
            <Input
              label={t('origin')}
              value={details.origin || ''}
              onChange={(e) => updateDetail('origin', e.target.value)}
            />
            <Input
              label={t('destination')}
              value={details.destination || ''}
              onChange={(e) => updateDetail('destination', e.target.value)}
            />
            <Input
              label={t('trackingNumber')}
              value={details.trackingNumber || ''}
              onChange={(e) => updateDetail('trackingNumber', e.target.value)}
            />
          </div>
        );

      case 'umrah':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t('umrahPackage')}
              value={details.umrahPackage || ''}
              onChange={(e) => updateDetail('umrahPackage', e.target.value)}
              placeholder={t('economy') + ', ' + t('standard') + ', ' + t('premium')}
            />
            <Input
              label={t('visaValidity')}
              type="date"
              value={details.visaValidity || ''}
              onChange={(e) => updateDetail('visaValidity', e.target.value)}
            />
            <Input
              label={t('hotelName')}
              value={details.hotelName || ''}
              onChange={(e) => updateDetail('hotelName', e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('serviceForms')}</h1>
          <p className="text-gray-600 mt-1">{t('createServiceTransaction')}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/transactions')}>
          {t('viewTransactions')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('transaction');
              setSelectedGovServiceId(null);
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'transaction'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('services')}
          </button>
          <button
            onClick={() => {
              setActiveTab('government');
              setSelectedGovServiceId(null);
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'government'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('governmentServices')}
          </button>
        </nav>
      </div>

      {/* Government Services Tab - Manage Services */}
      {activeTab === 'government' && !selectedGovServiceId && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('governmentServices')}</h2>
            <Button onClick={() => setShowAddModal(true)}>
              + {t('addNewService')}
            </Button>
          </div>

          {/* Service Cards Grid */}
          {governmentServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {governmentServices.map((service) => (
                <Card 
                  key={service.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200"
                  onClick={() => openServiceLink(service.link!)}
                >
                  <CardContent className="text-center p-6">
                    <div className="text-5xl mb-3">{service.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                    )}
                    <div className="inline-flex items-center text-primary-600 text-sm font-medium">
                      <span>{t('openLink')}</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noGovernmentServices')}</h3>
              <p className="text-gray-600 mb-4">{t('addFirstGovernmentService')}</p>
              <Button onClick={() => setShowAddModal(true)}>
                + {t('addNewService')}
              </Button>
            </div>
          )}

          {/* Add Service Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>{t('addNewService')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label={t('serviceName')}
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder={t('enterServiceName')}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('icon')}</label>
                    <div className="flex flex-wrap gap-2">
                      {['🔗', '🏛️', '📋', '📄', '🔍', '💻', '🌐', '📱', '🖥️', '📝', '🎫', '🏢'].map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setNewService({ ...newService, icon })}
                          className={`w-10 h-10 text-xl rounded-lg border-2 ${
                            newService.icon === icon
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    label={t('link')}
                    value={newService.link}
                    onChange={(e) => setNewService({ ...newService, link: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                  <Input
                    label={t('description')}
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder={t('enterDescription')}
                  />
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddModal(false)}>
                      {t('cancel')}
                    </Button>
                    <Button
                      onClick={handleAddGovernmentService}
                      disabled={!newService.name || !newService.link}
                    >
                      {t('save')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Transaction Services Tab */}
      {activeTab === 'transaction' && (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Service Type Selection - Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('selectService')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SERVICE_TYPES.map((type) => {
              const isSelected = selectedType === type.code && !selectedGovServiceId;
              return (
                <button
                  key={type.code}
                  onClick={() => {
                    setSelectedType(type.code);
                    setSelectedGovServiceId(null);
                    setDetails({});
                  }}
                  className={`w-full flex items-center p-3 rounded-lg transition-all ${
                    isSelected
                      ? `${type.color} border-2 border-current`
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl mr-3">{type.icon}</span>
                  <span className={`font-medium ${isSelected ? '' : 'text-gray-700'}`}>
                    {getServiceName(type.code)}
                  </span>
                </button>
              );
            })}
            
            {/* Divider */}
            {governmentServices.length > 0 && (
              <>
                <div className="border-t border-gray-200 my-2" />
                <p className="text-xs text-gray-500 px-3 py-1">{t('governmentServices')}</p>
              </>
            )}
            
            {/* Government Services in sidebar */}
            {governmentServices.map((service) => {
              const isSelected = selectedGovServiceId === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedGovServiceId(service.id);
                    setSelectedType('air_ticket');
                    setDetails({});
                  }}
                  className={`w-full flex items-center p-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl mr-3">{service.icon}</span>
                  <span className={`font-medium text-sm ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                    {service.name}
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Main Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>{t('customerInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showNewCustomer ? (
                <>
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                        <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                        {selectedCustomer.passportNumber && (
                          <p className="text-sm text-gray-500">
                            {t('passport')}: {selectedCustomer.passportNumber}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setCustomerSearch('');
                        }}
                      >
                        {t('change')}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Input
                        label={t('searchCustomer')}
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder={t('searchByNamePhone')}
                      />
                      {searchResults.length > 0 && (
                        <div className="mt-2 border rounded-lg divide-y max-h-48 overflow-y-auto">
                          {searchResults.map((customer) => (
                            <button
                              key={customer.id}
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setCustomerSearch('');
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <p className="font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.phone}</p>
                            </button>
                          ))}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        className="mt-3"
                        onClick={() => setShowNewCustomer(true)}
                      >
                        + {t('addNewCustomer')}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{t('newCustomer')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t('customerName')}
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      required
                    />
                    <Input
                      label={t('phoneNumber')}
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      required
                    />
                    <Input
                      label={t('email')}
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                    <Input
                      label={t('passportNumber')}
                      value={newCustomer.passportNumber}
                      onChange={(e) => setNewCustomer({ ...newCustomer, passportNumber: e.target.value })}
                    />
                    <Input
                      label={t('iqamaNumber')}
                      value={newCustomer.iqamaNumber}
                      onChange={(e) => setNewCustomer({ ...newCustomer, iqamaNumber: e.target.value })}
                    />
                    <Input
                      label={t('nationality')}
                      value={newCustomer.nationality}
                      onChange={(e) => setNewCustomer({ ...newCustomer, nationality: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateCustomer} disabled={!newCustomer.name || !newCustomer.phone}>
                      {t('saveCustomer')}
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewCustomer(false)}>
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedGovService ? selectedGovService.name : t('serviceDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedGovService ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">{selectedGovService.icon}</div>
                  {selectedGovService.description && (
                    <p className="text-gray-600">{selectedGovService.description}</p>
                  )}
                  <a
                    href={selectedGovService.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 text-primary-600 hover:text-primary-800 font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      openServiceLink(selectedGovService.link!);
                    }}
                  >
                    <span>{t('openLink')}</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ) : (
                renderServiceForm()
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={t('totalAmount')}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                />
                <Input
                  label={t('paidAmount')}
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0.00"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('dueAmount')}</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-lg font-medium text-gray-900">
                    {dueAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('additionalNotes')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/transactions')}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCustomer || !amount}
            >
              {t('createTransaction')}
            </Button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
