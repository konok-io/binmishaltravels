import React, { useMemo } from 'react';
import { useI18n } from '@/i18n';
import { useAuthStore, useTransactionStore } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface MonthData {
  month: string;
  revenue: number;
  count: number;
}

interface DayData {
  day: string;
  revenue: number;
  count: number;
}

interface ServiceData {
  code: string;
  name: string;
  value: number;
  count: number;
}

interface StatusData {
  name: string;
  count: number;
  fill: string;
}

interface CustomerData {
  id: string;
  name: string;
  spent: number;
  transactions: number;
}

export const DashboardCharts: React.FC = () => {
  const { t, language } = useI18n();
  const { user } = useAuthStore();
  const { transactions } = useTransactionStore();

  const isSuperAdmin = user?.role === 'super_admin';
  const branchFilter = isSuperAdmin ? undefined : user?.branchId;

  const filteredTransactions = useMemo(() => {
    if (!branchFilter) return transactions;
    return transactions.filter(t => t.branchId === branchFilter);
  }, [transactions, branchFilter]);

  const monthlyRevenue = useMemo(() => {
    const months: Record<string, MonthData> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString(language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' });
      months[key] = { month: monthName, revenue: 0, count: 0 };
    }

    filteredTransactions.forEach(txn => {
      const date = new Date(txn.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].revenue += txn.amount;
        months[key].count += 1;
      }
    });

    return Object.values(months);
  }, [filteredTransactions, language]);

  const serviceDistribution = useMemo(() => {
    const services: Record<string, ServiceData> = {};

    filteredTransactions.forEach(txn => {
      const code = txn.serviceCode || 'other';
      if (!services[code]) {
        services[code] = { code, name: txn.serviceName, value: 0, count: 0 };
      }
      services[code].value += txn.amount;
      services[code].count += 1;
    });

    return Object.values(services)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredTransactions]);

  const transactionStatus = useMemo(() => {
    const status = { completed: 0, pending: 0, processing: 0, cancelled: 0 };
    filteredTransactions.forEach(txn => {
      if (status.hasOwnProperty(txn.status)) {
        status[txn.status as keyof typeof status]++;
      }
    });
    const statusData: StatusData[] = [
      { name: t('completed'), count: status.completed, fill: '#10B981' },
      { name: t('processing'), count: status.processing, fill: '#3B82F6' },
      { name: t('pending'), count: status.pending, fill: '#F59E0B' },
      { name: t('cancelled'), count: status.cancelled, fill: '#EF4444' },
    ];
    return statusData;
  }, [filteredTransactions, t]);

  const topCustomers = useMemo(() => {
    const customerSpending: Record<string, CustomerData> = {};

    filteredTransactions.forEach(txn => {
      if (!customerSpending[txn.customerId]) {
        customerSpending[txn.customerId] = { id: txn.customerId, name: txn.customerName, spent: 0, transactions: 0 };
      }
      customerSpending[txn.customerId].spent += txn.amount;
      customerSpending[txn.customerId].transactions += 1;
    });

    return Object.values(customerSpending)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [filteredTransactions]);

  const dailyRevenue = useMemo(() => {
    const days: Record<string, DayData> = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayName = date.toLocaleDateString(language === 'bn' ? 'bn-BD' : language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' });
      days[key] = { day: dayName, revenue: 0, count: 0 };
    }

    filteredTransactions.forEach(txn => {
      const date = new Date(txn.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (days[key]) {
        days[key].revenue += txn.amount;
        days[key].count += 1;
      }
    });

    return Object.values(days);
  }, [filteredTransactions, language]);

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = filteredTransactions.length;
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-blue-100 text-sm">{t('totalRevenue')}</p>
            <p className="text-2xl font-bold mt-1">{totalRevenue.toLocaleString()} SAR</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-green-100 text-sm">{t('totalTransactions')}</p>
            <p className="text-2xl font-bold mt-1">{totalTransactions}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 text-center">
            <p className="text-purple-100 text-sm">{t('avgTransactionValue')}</p>
            <p className="text-2xl font-bold mt-1">{avgTransactionValue.toLocaleString()} SAR</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('revenueTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} SAR`, t('revenue')]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    name={t('revenue')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dailyRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value: any, name: any) => {
                      if (name === 'revenue') return [`${Number(value).toLocaleString()} SAR`, t('revenue')];
                      return [value, t('transactions')];
                    }}
                  />
                  <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name={t('revenue')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('serviceDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center">
              {serviceDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {serviceDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      formatter={(value: any) => [`${Number(value).toLocaleString()} SAR`, t('revenue')]}
                    />
                    <Legend
                      formatter={(value) => <span className="text-gray-700 text-sm">{value}</span>}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {t('noData')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('transactionStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value: any, name: any) => [value, t(String(name).toLowerCase())]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {transactionStatus.map((statusItem, index) => (
                      <Cell key={`cell-${index}`} fill={statusItem.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('topCustomers')}</CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('rank')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">{t('customer')}</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('transactions')}</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">{t('totalSpent')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((customer, index) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{customer.name}</p>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {customer.transactions} {t('transactions').toLowerCase()}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-blue-600">
                          {customer.spent.toLocaleString()} SAR
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">{t('noData')}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
