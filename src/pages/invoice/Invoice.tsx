import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useTransactionStore, useCustomerStore, useBranchStore, useServiceStore } from '@/store';
import { Button } from '@/components/common/Button';
import type { ServiceTransaction } from '@/types';

interface InvoiceProps {
  transaction: ServiceTransaction;
  onClose?: () => void;
  isPrintMode?: boolean;
}

export const Invoice: React.FC<InvoiceProps> = ({ transaction, onClose, isPrintMode }) => {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const { customers } = useCustomerStore();
  const { branches } = useBranchStore();
  const { services } = useServiceStore();

  const fullTransaction = useMemo((): ServiceTransaction | null => {
    if (!transaction) return null;
    const found = transactions.find(t => t.id === transaction.id);
    return found || transaction;
  }, [transaction, transactions]);

  const customer = useMemo(() => {
    if (!fullTransaction) return null;
    return customers.find(c => c.id === fullTransaction.customerId);
  }, [customers, fullTransaction]);

  const branch = useMemo(() => {
    if (!fullTransaction) return null;
    return branches.find(b => b.id === fullTransaction.branchId);
  }, [branches, fullTransaction]);

  const service = useMemo(() => {
    if (!fullTransaction) return null;
    return services.find(s => s.id === fullTransaction.serviceId);
  }, [services, fullTransaction]);

  const discount = (fullTransaction as any).discount || 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(
      language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  const generateInvoiceNumber = (txn: ServiceTransaction) => {
    const date = new Date(txn.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${year}${month}-${random}`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  if (!fullTransaction) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-gray-500">{t('transactionNotFound')}</p>
        <Button onClick={() => navigate('/transactions')} className="mt-4">
          {t('back')}
        </Button>
      </div>
    );
  }

  const invoiceNumber = generateInvoiceNumber(fullTransaction);
  const today = formatDate(new Date().toISOString());

  return (
    <div className={isPrintMode ? '' : 'max-w-2xl mx-auto p-6'}>
      {/* Print Button (only show when not in print mode) */}
      {!isPrintMode && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t('invoice')}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('print')}
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                {t('close')}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Invoice Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" id="invoice-content">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">বিন মিশাল ট্রাভেলস</h1>
              <p className="text-primary-100 mt-1">Bin Mishal Travels</p>
              <p className="text-primary-100 text-sm mt-2">{branch?.address || 'Riyadh, Saudi Arabia'}</p>
              <p className="text-primary-100 text-sm">Tel: +966 XX XXX XXXX</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">INVOICE</h2>
              <p className="text-primary-100 mt-2">#{invoiceNumber}</p>
              <p className="text-primary-100 text-sm mt-1">Date: {today}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">{t('billTo')}</h3>
              <p className="font-semibold text-gray-900">{fullTransaction.customerName}</p>
              {customer?.phone && <p className="text-gray-600 text-sm">{customer.phone}</p>}
              {customer?.address && <p className="text-gray-600 text-sm">{customer.address}</p>}
              {fullTransaction.customerPhone && (
                <p className="text-gray-600 text-sm">Phone: {fullTransaction.customerPhone}</p>
              )}
              {fullTransaction.customerPassport && (
                <p className="text-gray-600 text-sm">Passport: {fullTransaction.customerPassport}</p>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">{t('transactionDetails')}</h3>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">ID:</span> {fullTransaction.id}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Date:</span> {formatDateTime(fullTransaction.createdAt)}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Status:</span> {getStatusLabel(fullTransaction.status)}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Branch:</span> {fullTransaction.branchName}
              </p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 text-sm font-semibold text-gray-600">{t('service')}</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600">{t('details')}</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-600">{t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4">
                  <p className="font-medium text-gray-900">{fullTransaction.serviceName}</p>
                  <p className="text-gray-500 text-sm">{service?.description || fullTransaction.serviceCode}</p>
                </td>
                <td className="py-4 text-right text-gray-600 text-sm">
                  {fullTransaction.details && Object.entries(fullTransaction.details).map(([key, value]) => {
                    if (!value || key === 'notes') return null;
                    const labels: Record<string, string> = {
                      route: 'Route',
                      airline: 'Airline',
                      flightDate: 'Flight Date',
                      visaType: 'Visa Type',
                      iqamaNumber: 'Iqama Number',
                      profession: 'Profession',
                      weight: 'Weight',
                      cargoType: 'Cargo Type',
                      package: 'Package',
                    };
                    return (
                      <p key={key}>
                        <span className="font-medium">{labels[key] || key}:</span> {String(value)}
                      </p>
                    );
                  })}
                </td>
                <td className="py-4 text-right font-semibold text-gray-900">
                  {formatCurrency(fullTransaction.amount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('subtotal')}</span>
              <span className="text-gray-900">{formatCurrency(fullTransaction.amount)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('discount')}</span>
                <span className="text-green-600">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span className="text-gray-900">{t('total')}</span>
              <span className="text-primary-600">{formatCurrency(fullTransaction.amount)}</span>
            </div>

            {/* Payment Status */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">{t('totalAmount')}</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(fullTransaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('paidAmount')}</p>
                  <p className="font-semibold text-green-600">{formatCurrency(fullTransaction.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dueAmount')}</p>
                  <p className={`font-semibold ${fullTransaction.dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(fullTransaction.dueAmount)}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">{t('paymentProgress')}</span>
                  <span className="font-medium">{((fullTransaction.paidAmount / fullTransaction.amount) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(fullTransaction.paidAmount / fullTransaction.amount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {fullTransaction.details?.notes && (
          <div className="px-6 pb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">{t('notes')}</h4>
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">{fullTransaction.details.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t border-gray-200">
          <p>{t('thankYouMessage')}</p>
          <p className="mt-1">Powered by Bin Mishal Travels - {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};
