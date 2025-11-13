import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalsAPI } from '../services/api';
import toast from 'react-hot-toast';

export const queryKeys = {
  properties: ['rental-properties'],
  tenants: ['rental-tenants'],
  contracts: ['rental-contracts'],
  payments: ['rental-payments'],
  maintenance: ['rental-maintenance'],
  stats: ['rental-stats'],
};

// Fetch properties - REALTIME with 2-second background updates
export const useRentalProperties = () => {
  return useQuery({
    queryKey: queryKeys.properties,
    queryFn: async () => {
      const response = await rentalsAPI.getProperties();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
  });
};

// Fetch tenants - REALTIME with 1-second background updates
export const useRentalTenants = () => {
  return useQuery({
    queryKey: queryKeys.tenants,
    queryFn: async () => {
      const response = await rentalsAPI.getTenants();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
  });
};

// Fetch contracts - REALTIME with 1-second background updates
export const useRentalContracts = () => {
  return useQuery({
    queryKey: queryKeys.contracts,
    queryFn: async () => {
      const response = await rentalsAPI.getContracts();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
  });
};
// Fetch payments - REALTIME with 1-second background updates
export const useRentalPayments = () => {
  return useQuery({
    queryKey: queryKeys.payments,
    queryFn: async () => {
      const response = await rentalsAPI.getPayments();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
  });
};
// Fetch maintenance - REALTIME with 1-second background updates
export const useRentalMaintenance = () => {
  return useQuery({
    queryKey: queryKeys.maintenance,
    queryFn: async () => {
      const response = await rentalsAPI.getMaintenance();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
  });
};

// Fetch stats - REALTIME with 1-second background updates
export const useRentalStats = () => {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => {
      const response = await rentalsAPI.getStats();
      return response.data;
    },
    // Uses global config: refetchInterval: 1000 (REALTIME EVERY SECOND!)
  });
};

// Create property mutation
export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => rentalsAPI.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      toast.success('Property added successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to add property';
      toast.error(errorMessage);
    },
  });
};

// Update property mutation
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => rentalsAPI.updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      toast.success('Property updated successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to update property';
      toast.error(errorMessage);
    },
  });
};

// Delete property mutation
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => rentalsAPI.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      toast.success('Property deleted successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to delete property';
      toast.error(errorMessage);
    },
  });
};

// Similar mutations for tenants, contracts, payments, maintenance...
export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => rentalsAPI.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      toast.success('Tenant added successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to add tenant';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => rentalsAPI.updateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants });
      toast.success('Tenant updated successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to update tenant';
      toast.error(errorMessage);
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => rentalsAPI.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      toast.success('Tenant deleted successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to delete tenant';
      toast.error(errorMessage);
    },
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => rentalsAPI.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      toast.success('Contract created successfully!');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to create contract';
      toast.error(errorMessage);
    },
  });
};
