import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI } from '../services/api';
import toast from 'react-hot-toast';

export const queryKeys = {
  staff: ['staff'],
  staffById: (id) => ['staff', id],
};

// Fetch all staff
export const useStaff = () => {
  return useQuery({
    queryKey: queryKeys.staff,
    queryFn: async () => {
      const response = await staffAPI.getAll();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
  });
};

// Create staff mutation
export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => staffAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff });
      toast.success('Staff member added successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to add staff member';
      toast.error(errorMessage);
    },
  });
};

// Update staff mutation
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => staffAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff });
      toast.success('Staff member updated successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to update staff member';
      toast.error(errorMessage);
    },
  });
};

// Delete staff mutation
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => staffAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff });
      toast.success('Staff member deleted successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to delete staff member';
      toast.error(errorMessage);
    },
  });
};

// Reset password mutation
export const useResetStaffPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, password }) => staffAPI.resetPassword(id, password),
    onSuccess: () => {
      toast.success('Password reset successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
    },
  });
};
