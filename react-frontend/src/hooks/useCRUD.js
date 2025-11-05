/**
 * useCRUD Hook
 * Reusable CRUD operations with loading states
 */

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useCRUD = (api, options = {}) => {
  const {
    resourceName = 'item',
    onSuccess = null,
    onError = null,
    fetchOnMount = true,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all items
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAll();
      const fetchedData = response.data?.data || response.data || [];
      setData(fetchedData);
      return fetchedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to fetch ${resourceName}s`;
      setError(errorMessage);
      toast.error(errorMessage);
      if (onError) onError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [api, resourceName, onError]);

  // Fetch single item
  const fetchOne = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getById(id);
      return response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to fetch ${resourceName}`;
      setError(errorMessage);
      toast.error(errorMessage);
      if (onError) onError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [api, resourceName, onError]);

  // Create item
  const create = useCallback(async (itemData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.create(itemData);
      const newItem = response.data?.data || response.data;
      
      // Add to local state
      setData(prev => [...prev, newItem]);
      
      toast.success(`${resourceName} created successfully`);
      if (onSuccess) onSuccess(newItem, 'create');
      
      return newItem;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to create ${resourceName}`;
      setError(errorMessage);
      toast.error(errorMessage);
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, resourceName, onSuccess, onError]);

  // Update item
  const update = useCallback(async (id, itemData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.update(id, itemData);
      const updatedItem = response.data?.data || response.data;
      
      // Update local state
      setData(prev => prev.map(item => 
        (item.id === id || item.product_id === id || item.category_id === id || 
         item.order_id === id || item.inventory_id === id || item.staff_id === id) 
          ? updatedItem 
          : item
      ));
      
      toast.success(`${resourceName} updated successfully`);
      if (onSuccess) onSuccess(updatedItem, 'update');
      
      return updatedItem;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to update ${resourceName}`;
      setError(errorMessage);
      toast.error(errorMessage);
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, resourceName, onSuccess, onError]);

  // Delete item
  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await api.delete(id);
      
      // Remove from local state
      setData(prev => prev.filter(item => 
        item.id !== id && item.product_id !== id && item.category_id !== id && 
        item.order_id !== id && item.inventory_id !== id && item.staff_id !== id
      ));
      
      toast.success(`${resourceName} deleted successfully`);
      if (onSuccess) onSuccess(null, 'delete');
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to delete ${resourceName}`;
      setError(errorMessage);
      toast.error(errorMessage);
      if (onError) onError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [api, resourceName, onSuccess, onError]);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchAll();
  }, [fetchAll]);

  // Fetch on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchAll();
    }
  }, [fetchOnMount, fetchAll]);

  return {
    data,
    loading,
    error,
    setData,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    refresh,
  };
};
