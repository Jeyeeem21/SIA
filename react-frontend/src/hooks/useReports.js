import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsAPI } from '../services/api';

export const queryKeys = {
  summary: ['reports-summary'],
  transactions: (filters) => ['reports-transactions', filters],
  salesAnalytics: ['sales-analytics'],
};

// Fetch reports summary
export const useReportsSummary = () => {
  return useQuery({
    queryKey: queryKeys.summary,
    queryFn: async () => {
      const response = await reportsAPI.getSummary();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Fetch transactions with filters
export const useReportsTransactions = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: async () => {
      const response = await reportsAPI.getTransactions(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!filters, // Only fetch if filters are provided
  });
};

// Fetch sales analytics
export const useSalesAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.salesAnalytics,
    queryFn: async () => {
      const response = await reportsAPI.getSalesAnalytics();
      return response.data;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
};
