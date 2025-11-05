/**
 * usePagination Hook
 * Reusable pagination logic for tables/lists
 */

import { useState, useMemo } from 'react';

export const usePagination = (items = [], defaultItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  // Reset to page 1 when items change
  const resetPage = () => setCurrentPage(1);

  // Go to specific page
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  // Change items per page
  const changeItemsPerPage = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    setCurrentPage: goToPage,
    setItemsPerPage: changeItemsPerPage,
    resetPage,
    totalItems: items.length,
  };
};
