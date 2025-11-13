import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // ALWAYS stale = always use cache + background update (NO loading!)
      gcTime: 1000 * 60 * 60 * 24, // 24 HOURS cache retention (SUPER long for INSTANT page loads!)
      refetchOnWindowFocus: false, // NO refetch on focus (background updates handle this)
      refetchOnReconnect: false, // NO refetch on reconnect
      refetchOnMount: 'always', // ALWAYS use cache immediately (NO loading spinner!)
      refetchInterval: 1000 * 1, // REALTIME: Refetch EVERY SECOND for instant updates!
      refetchIntervalInBackground: true, // CRITICAL: Continue updating even when tab not visible (multi-user POS)
      retry: 0, // NO retries - instant feedback
      retryDelay: 0,
      networkMode: 'online',
      suspense: false,
      // CRITICAL: Always show cached data INSTANTLY while refetching (NO loading spinners!)
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      retry: 0, // NO retries - instant response
      retryDelay: 0,
      networkMode: 'online',
    },
  },
});

// Query Keys - Centralized for easy cache invalidation
export const queryKeys = {
  // Products
  products: ['products'],
  product: (id) => ['products', id],
  
  // Inventory
  inventory: ['inventory'],
  inventoryItem: (id) => ['inventory', id],
  
  // Orders
  orders: ['orders'],
  order: (id) => ['orders', id],
  todaysOrders: ['orders', 'today'],
  searchOrder: (orderNumber) => ['orders', 'search', orderNumber],
  
  // Categories
  categories: ['categories'],
  category: (id) => ['categories', id],
  
  // Dashboard
  dashboard: ['dashboard'],
  
  // Transactions
  transactions: (period) => ['transactions', period],
  growthRates: (period) => ['growthRates', period],
  salesHistory: (period) => ['salesHistory', period],
  
  // Staff
  staff: ['staff'],
  staffMember: (id) => ['staff', id],
  
  // Rentals
  rentalProperties: ['rental-properties'],
  rentalTenants: ['rental-tenants'],
  rentalContracts: ['rental-contracts'],
  rentalPayments: ['rental-payments'],
  rentalMaintenance: ['rental-maintenance'],
  rentalStats: ['rental-stats'],
  
  // Reports
  reports: (params) => ['reports', params],
  reportsSummary: ['reports-summary'],
  reportsTransactions: (filters) => ['reports-transactions', filters],
  
  // Analytics
  analytics: ['analytics'],
};

export default queryClient;
