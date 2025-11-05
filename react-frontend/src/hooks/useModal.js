/**
 * useModal Hook
 * Reusable modal state management
 */

import { useState, useCallback } from 'react';

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback((data = null) => {
    setModalData(data);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Clear data after animation completes
    setTimeout(() => setModalData(null), 300);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    modalData,
    openModal,
    closeModal,
    toggleModal,
    setModalData,
  };
};

// Hook for managing multiple modals
export const useModals = (modalNames = []) => {
  const [modals, setModals] = useState(
    modalNames.reduce((acc, name) => {
      acc[name] = { isOpen: false, data: null };
      return acc;
    }, {})
  );

  const openModal = useCallback((modalName, data = null) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { isOpen: true, data }
    }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { isOpen: false, data: null }
    }));
  }, []);

  const getModal = useCallback((modalName) => {
    return modals[modalName] || { isOpen: false, data: null };
  }, [modals]);

  return {
    modals,
    openModal,
    closeModal,
    getModal,
  };
};
