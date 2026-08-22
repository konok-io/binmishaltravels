import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { useAuthStore } from '@/store';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/auth/Login';
import { Dashboard } from '@/pages/branch/Dashboard';
import { Transactions } from '@/pages/transactions';
import { NewTransaction } from '@/pages/transactions/new';
import { Customers } from '@/pages/customers';
import { AddCustomer } from '@/pages/customers/new';
import { Reports } from '@/pages/reports';
import { Branches } from '@/pages/branches';
import { Users } from '@/pages/users';
import { Settings } from '@/pages/settings';
import { Services } from '@/pages/services';
import { CustomerDetails } from '@/pages/customer';
import { TransactionView } from '@/pages/transaction/view';
import { TransactionEdit } from '@/pages/transaction/edit';
import { useInitializeData } from '@/hooks/useInitialize';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  React.useEffect(() => {
    // Check localStorage on mount
    const storedData = localStorage.getItem('binmishal_auth');
    if (storedData) {
      try {
        const { token, user } = JSON.parse(storedData);
        if (token && user) {
          useAuthStore.setState({ token, user, isAuthenticated: true });
        }
      } catch {
        // invalid stored data
      }
    }
    setIsInitialized(true);
  }, []);

  useInitializeData();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transactions/new" element={<NewTransaction />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/new" element={<AddCustomer />} />
        <Route path="customer/:id" element={<CustomerDetails />} />
        <Route path="transaction/:id" element={<TransactionView />} />
        <Route path="transaction/:id/edit" element={<TransactionEdit />} />
        <Route path="reports" element={<Reports />} />
        <Route path="branches" element={<Branches />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="services" element={<Services />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </I18nProvider>
  );
};

export default App;
