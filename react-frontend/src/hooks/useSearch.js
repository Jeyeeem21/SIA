/**
 * useSearch Hook
 * Reusable search/filter logic
 */

import { useState, useMemo } from 'react';

export const useSearch = (items = [], searchFields = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('All');

  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Apply status/type filter
    if (filterBy && filterBy !== 'All') {
      filtered = filtered.filter(item => {
        // Check common filter fields
        return (
          item.status?.toLowerCase() === filterBy.toLowerCase() ||
          item.type?.toLowerCase() === filterBy.toLowerCase() ||
          item.service_type?.toLowerCase() === filterBy.toLowerCase()
        );
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        // If specific search fields provided, search only those
        if (searchFields.length > 0) {
          return searchFields.some(field => {
            const value = getNestedValue(item, field);
            return value?.toString().toLowerCase().includes(query);
          });
        }
        
        // Otherwise search all string fields
        return Object.values(item).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          return false;
        });
      });
    }

    return filtered;
  }, [items, searchQuery, filterBy, searchFields]);

  // Helper to get nested object values (e.g., "product.name")
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Clear search and filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterBy('All');
  };

  return {
    searchQuery,
    setSearchQuery,
    filterBy,
    setFilterBy,
    filteredItems,
    clearFilters,
  };
};
