import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { productsAPI } from '../services/api';
import toast from 'react-hot-toast';

// Fetch all products - REALTIME updates EVERY SECOND (uses global config)
export const useProducts = () => {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const response = await productsAPI.getAll();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
    // Stock updates appear instantly without loading spinners
  });
};

// Fetch single product
export const useProduct = (id) => {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const response = await productsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create product mutation - INSTANT RESPONSE
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => productsAPI.create(data),
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products });
      
      const previousProducts = queryClient.getQueryData(queryKeys.products);
      const tempId = 'temp-' + Date.now();
      
      // INSTANT: Add to UI immediately
      queryClient.setQueryData(queryKeys.products, (old) => {
        return old ? [{ ...newProduct, product_id: tempId, category: { category_name: 'Loading...' }, inventory: { quantity: 0 } }, ...old] : [newProduct];
      });
      
      // INSTANT: Show success toast immediately
      toast.success('Product added!', { duration: 2000 });
      
      return { previousProducts, tempId };
    },
    onSuccess: (response, variables, context) => {
      // Replace temp item with real data from server
      queryClient.setQueryData(queryKeys.products, (old) => {
        return old?.map(item => item.product_id === context.tempId ? response.data : item);
      });
    },
    onError: (err, newProduct, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.products, context.previousProducts);
      toast.error('Failed to create product - rolled back');
    },
  });
};

// Update product mutation - INSTANT RESPONSE
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => productsAPI.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products });
      
      const previousProducts = queryClient.getQueryData(queryKeys.products);
      
      // INSTANT: Update UI immediately
      queryClient.setQueryData(queryKeys.products, (old) => {
        return old?.map((item) => 
          item.product_id === id ? { ...item, ...data } : item
        );
      });
      
      // INSTANT: Show success immediately
      toast.success('Product updated!', { duration: 1500 });
      
      return { previousProducts };
    },
    onSuccess: (response) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.products, (old) => {
        return old?.map(item => item.product_id === response.data.product_id ? response.data : item);
      });
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.products, context.previousProducts);
      
      // Better error messages
      if (err.response?.status === 404) {
        toast.error('Product not found - it may have been deleted');
      } else if (err.response?.status === 422) {
        toast.error(err.response?.data?.message || 'Validation error');
      } else {
        toast.error('Update failed - rolled back');
      }
    },
  });
};

// Delete product mutation - INSTANT RESPONSE
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => productsAPI.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products });
      
      const previousProducts = queryClient.getQueryData(queryKeys.products);
      
      // INSTANT: Remove from UI immediately
      queryClient.setQueryData(queryKeys.products, (old) => {
        return old?.filter((item) => item.product_id !== id);
      });
      
      // INSTANT: Show success immediately
      toast.success('Product deleted!', { duration: 1500 });
      
      return { previousProducts };
    },
    onError: (err, id, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.products, context.previousProducts);
      
      // Better error messages
      if (err.response?.status === 404) {
        toast.error('Product already deleted or not found');
      } else if (err.response?.status === 422) {
        toast.error(err.response?.data?.message || 'Cannot delete product');
      } else {
        toast.error('Delete failed - rolled back');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ['growthRates'] }); // Refresh growth analysis
    },
  });
};
