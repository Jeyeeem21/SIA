import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';

// Fetch all inventory - REALTIME updates EVERY SECOND (uses global config)
export const useInventory = () => {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: async () => {
      const response = await inventoryAPI.getAll();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
    // Stock updates appear instantly without loading spinners
  });
};

// Fetch single inventory item
export const useInventoryItem = (id) => {
  return useQuery({
    queryKey: queryKeys.inventoryItem(id),
    queryFn: async () => {
      const response = await inventoryAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create inventory mutation
export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => inventoryAPI.create(data),
    onMutate: async (newInventory) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.inventory });
      
      // Snapshot previous value
      const previousInventory = queryClient.getQueryData(queryKeys.inventory);
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.inventory, (old) => {
        return old ? [...old, { ...newInventory, inventory_id: 'temp-' + Date.now() }] : [newInventory];
      });
      
      return { previousInventory };
    },
    onError: (err, newInventory, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.inventory, context.previousInventory);
      toast.error('Failed to create inventory');
    },
    onSuccess: () => {
      toast.success('Inventory created successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ['growthRates'] }); // Refresh growth analysis
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Refresh reports
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
    },
  });
};

// Update inventory mutation - INSTANT RESPONSE
export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => inventoryAPI.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.inventory });
      
      const previousInventory = queryClient.getQueryData(queryKeys.inventory);
      
      // INSTANT: Update UI immediately
      queryClient.setQueryData(queryKeys.inventory, (old) => {
        return old?.map((item) => 
          item.inventory_id === id ? { ...item, ...data } : item
        );
      });
      
      // INSTANT: Show success immediately
      toast.success('Inventory updated!', { duration: 1500 });
      
      return { previousInventory };
    },
    onSuccess: (response) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.inventory, (old) => {
        return old?.map(item => item.inventory_id === response.data.inventory_id ? response.data : item);
      });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.inventory, context.previousInventory);
      toast.error('Update failed - rolled back');
    },
  });
};

// Restock mutation
export const useRestockInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, quantity }) => inventoryAPI.restock(id, quantity),
    onMutate: async ({ id, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.inventory });
      
      const previousInventory = queryClient.getQueryData(queryKeys.inventory);
      
      queryClient.setQueryData(queryKeys.inventory, (old) => {
        return old?.map((item) => 
          item.inventory_id === id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      });
      
      return { previousInventory };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKeys.inventory, context.previousInventory);
      toast.error('Failed to restock');
    },
    onSuccess: (data, variables) => {
      toast.success(`Restocked ${variables.quantity} units successfully!`);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ['growthRates'] }); // Refresh growth analysis
      queryClient.invalidateQueries({ queryKey: ['salesHistory'] }); // Refresh sales history
      queryClient.invalidateQueries({ queryKey: ['reports'] }); // Refresh reports
    },
  });
};

// Delete inventory mutation
export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => inventoryAPI.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.inventory });
      
      const previousInventory = queryClient.getQueryData(queryKeys.inventory);
      
      queryClient.setQueryData(queryKeys.inventory, (old) => {
        return old?.filter((item) => item.inventory_id !== id);
      });
      
      return { previousInventory };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(queryKeys.inventory, context.previousInventory);
      toast.error('Failed to delete inventory');
    },
    onSuccess: () => {
      toast.success('Inventory deleted successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
    },
  });
};
