import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';

// Fetch all categories - REALTIME with 2-second background updates
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const response = await categoriesAPI.getAll();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
  });
};

// Create category mutation
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => categoriesAPI.create(data),
    onSuccess: () => {
      toast.success('Category created successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
};

// Update category mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => categoriesAPI.update(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
    onError: (err) => {
      // Better error messages
      if (err.response?.status === 404) {
        toast.error('Category not found - it may have been deleted');
      } else if (err.response?.status === 422) {
        toast.error(err.response?.data?.message || 'Validation error');
      } else {
        toast.error('Update failed');
      }
    },
  });
};

// Delete category mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => categoriesAPI.delete(id),
    onSuccess: () => {
      toast.success('Category deleted successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
    onError: (err) => {
      // Better error messages
      if (err.response?.status === 404) {
        toast.error('Category already deleted or not found');
      } else if (err.response?.status === 422) {
        toast.error(err.response?.data?.message || 'Cannot delete category');
      } else {
        toast.error('Delete failed');
      }
    },
  });
};
