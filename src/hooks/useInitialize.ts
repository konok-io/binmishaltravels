import { useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { useCustomerStore } from '@/store/customerStore';
import { useServiceStore } from '@/store/serviceStore';
import { useBranchStore } from '@/store/branchStore';

export const useInitializeData = () => {
  const { fetchTransactions, transactions } = useTransactionStore();
  const { fetchCustomers, customers } = useCustomerStore();
  const { fetchServices, services } = useServiceStore();
  const { fetchBranches, branches } = useBranchStore();

  useEffect(() => {
    const loadData = async () => {
      if (transactions.length === 0) {
        await fetchTransactions();
      }
      if (customers.length === 0) {
        await fetchCustomers();
      }
      if (services.length === 0) {
        await fetchServices();
      }
      if (branches.length === 0) {
        await fetchBranches();
      }
    };

    loadData();
  }, []);
};

export default useInitializeData;
