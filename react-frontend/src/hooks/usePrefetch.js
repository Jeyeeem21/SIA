import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { productsAPI, inventoryAPI, ordersAPI, categoriesAPI, dashboardAPI, staffAPI, rentalsAPI, reportsAPI } from '../services/api';

/**
 * Prefetch data on hover/interaction to make navigation instant
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchProducts = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products,
      queryFn: async () => {
        try {
          const response = await productsAPI.getAll();
          return response.data;
        } catch (error) {
          console.warn('Prefetch products failed:', error.message);
          return [];
        }
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  };

  const prefetchInventory = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.inventory,
      queryFn: async () => {
        try {
          const response = await inventoryAPI.getAll();
          return response.data;
        } catch (error) {
          console.warn('Prefetch inventory failed:', error.message);
          return [];
        }
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  const prefetchOrders = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.orders,
      queryFn: async () => {
        try {
          const response = await ordersAPI.getAll();
          return response.data;
        } catch (error) {
          console.warn('Prefetch orders failed:', error.message);
          return [];
        }
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchDashboard = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard,
      queryFn: async () => {
        try {
          const response = await dashboardAPI.getStats();
          return response.data;
        } catch (error) {
          console.warn('Prefetch dashboard failed:', error.message);
          return {};
        }
      },
      staleTime: 1000 * 30,
    });
  };

  const prefetchCategories = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories,
      queryFn: async () => {
        try {
          const response = await categoriesAPI.getAll();
          return response.data;
        } catch (error) {
          console.warn('Prefetch categories failed:', error.message);
          return [];
        }
      },
      staleTime: 1000 * 60 * 10, // Categories rarely change
    });
  };

  const prefetchStaff = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.staff,
      queryFn: async () => {
        try {
          const response = await staffAPI.getAll();
          return response.data;
        } catch (error) {
          console.warn('Prefetch staff failed:', error.message);
          return { staff: [] };
        }
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  const prefetchRentals = () => {
    // Prefetch all rental data
    queryClient.prefetchQuery({
      queryKey: queryKeys.rentalProperties,
      queryFn: async () => {
        try {
          const response = await rentalsAPI.getProperties();
          return response.data;
        } catch (error) {
          console.warn('Prefetch rentals failed:', error.message);
          return [];
        }
      },
      staleTime: 1000 * 60 * 5,
    });
    
    queryClient.prefetchQuery({
      queryKey: queryKeys.rentalStats,
      queryFn: async () => {
        try {
          const response = await rentalsAPI.getStats();
          return response.data;
        } catch (error) {
          console.warn('Prefetch rental stats failed:', error.message);
          return {};
        }
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchReports = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.reportsSummary,
      queryFn: async () => {
        try {
          const response = await reportsAPI.getSummary();
          return response.data;
        } catch (error) {
          console.warn('Prefetch reports failed:', error.message);
          return {};
        }
      },
      staleTime: 1000 * 60 * 2,
    });
  };

  return {
    prefetchProducts,
    prefetchInventory,
    prefetchOrders,
    prefetchDashboard,
    prefetchCategories,
    prefetchStaff,
    prefetchRentals,
    prefetchReports,
  };
};
