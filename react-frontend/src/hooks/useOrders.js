import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

// Fetch all orders - REALTIME updates every 5 seconds (uses global config)
export const useOrders = () => {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: async () => {
      const response = await ordersAPI.getAll();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
    // staleTime: 0, refetchOnMount: 'always', etc.
  });
};

// Fetch single order
export const useOrder = (id) => {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: async () => {
      const response = await ordersAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Search order by number
export const useSearchOrder = (orderNumber) => {
  return useQuery({
    queryKey: queryKeys.searchOrder(orderNumber),
    queryFn: async () => {
      const response = await ordersAPI.searchByOrderNumber(orderNumber);
      return response.data;
    },
    enabled: !!orderNumber && orderNumber.length >= 14,
  });
};

// Create order mutation - INSTANT RESPONSE
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => ordersAPI.create(data),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders });
      
      const previousOrders = queryClient.getQueryData(queryKeys.orders);
      const tempId = 'temp-' + Date.now();
      
      // INSTANT: Add to UI immediately
      queryClient.setQueryData(queryKeys.orders, (old) => {
        return old ? [{ ...newOrder, order_id: tempId, status: 'Pending', created_at: new Date().toISOString() }, ...old] : [newOrder];
      });
      
      // INSTANT: Show success immediately
      toast.success('Order created!', { duration: 1500 });
      
      return { previousOrders, tempId };
    },
    onSuccess: (response, variables, context) => {
      // Replace temp with real data
      queryClient.setQueryData(queryKeys.orders, (old) => {
        return old?.map(item => item.order_id === context.tempId ? response.data : item);
      });
    },
    onError: (err, newOrder, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.orders, context.previousOrders);
      toast.error('Order failed - rolled back');
    },
  });
};

// Complete order mutation - INSTANT with optimistic update
export const useCompleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, paymentData }) => ordersAPI.complete(id, paymentData),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders });
      
      const previousOrders = queryClient.getQueryData(queryKeys.orders);
      
      // INSTANT UI UPDATE - mark as completed immediately
      queryClient.setQueryData(queryKeys.orders, (old) => {
        return old?.map((order) => 
          order.order_id === id ? { ...order, status: 'Completed', completed_date: new Date().toISOString() } : order
        );
      });
      
      // Show success immediately
      toast.success('Order completed!', { duration: 2000 });
      
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders, context.previousOrders);
      }
      toast.error('Failed to complete order');
    },
    onSuccess: (response, variables) => {
      // DON'T invalidate inventory - let background refetch handle it naturally
      // Invalidate only non-critical queries
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ['salesAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['growthRates'] });
      queryClient.invalidateQueries({ queryKey: ['salesHistory'] });
    },
    onSettled: () => {
      // Let the 1-second background refetch handle inventory updates naturally
      // NO FORCED REFETCH - prevents flickering back to old stock
    },
  });
};

// Void order mutation - INSTANT with optimistic update
export const useVoidOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }) => ordersAPI.voidOrder(id, { void_reason: reason }),
    onMutate: async ({ id, reason }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders });
      
      const previousOrders = queryClient.getQueryData(queryKeys.orders);
      
      // INSTANT UI UPDATE - void immediately
      queryClient.setQueryData(queryKeys.orders, (old) => {
        return old?.map((order) => 
          order.order_id === id ? { ...order, is_voided: true, status: 'Cancelled', void_reason: reason } : order
        );
      });
      
      // Show success immediately
      toast.success('Order voided!', { duration: 2000 });
      
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders, context.previousOrders);
      }
      toast.error('Failed to void order');
    },
    onSettled: () => {
      // Background refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ['salesAnalytics'] }); // Refresh dashboard analytics
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Refresh reports
      queryClient.invalidateQueries({ queryKey: ['growthRates'] }); // Refresh growth analysis
      queryClient.invalidateQueries({ queryKey: ['salesHistory'] }); // Refresh sales history
    },
  });
};

// Update order mutation - INSTANT with optimistic update
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => ordersAPI.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders });
      
      // Snapshot previous value
      const previousOrders = queryClient.getQueryData(queryKeys.orders);
      
      // Optimistically update - INSTANT UI UPDATE!
      queryClient.setQueryData(queryKeys.orders, (old) => {
        if (!old) return old;
        return old.map((order) => {
          if (order.order_id === id) {
            // Merge updated data with existing order
            return {
              ...order,
              ...data,
              // Recalculate total if order_items changed
              total_amount: data.order_items 
                ? data.order_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
                : order.total_amount
            };
          }
          return order;
        });
      });
      
      // Show success immediately
      toast.success('Order updated!', { duration: 2000 });
      
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKeys.orders, context.previousOrders);
      }
      const errorMessage = err.response?.data?.message || err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Failed to update order';
      toast.error(errorMessage);
      console.error('Update order error:', err.response?.data);
    },
    onSettled: () => {
      // Refetch in background to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Refresh reports
      queryClient.invalidateQueries({ queryKey: ['growthRates'] }); // Refresh growth analysis
      queryClient.invalidateQueries({ queryKey: ['salesHistory'] }); // Refresh sales history
    },
  });
};

// Fetch today's orders
export const useTodaysOrders = () => {
  return useQuery({
    queryKey: queryKeys.todaysOrders,
    queryFn: async () => {
      const response = await ordersAPI.getAll();
      // Filter today's orders on client side
      const today = new Date().toISOString().split('T')[0];
      return response.data.filter(order => 
        order.created_at?.startsWith(today)
      );
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
  });
};
