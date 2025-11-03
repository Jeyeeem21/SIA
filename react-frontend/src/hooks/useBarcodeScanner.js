import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle barcode scanner input
 * Barcode scanners typically simulate keyboard input very fast
 * This hook captures that rapid input and triggers a callback
 */
const useBarcodeScanner = (onScan, enabled = true, minLength = 3) => {
  const barcodeRef = useRef('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Handle Enter key - end of barcode scan
      if (e.key === 'Enter') {
        if (barcodeRef.current.length >= minLength) {
          onScan(barcodeRef.current);
        }
        barcodeRef.current = '';
        return;
      }

      // Accumulate barcode characters
      if (e.key.length === 1) {
        barcodeRef.current += e.key;

        // Auto-submit after 100ms of no input (barcode scanners are very fast)
        timeoutRef.current = setTimeout(() => {
          if (barcodeRef.current.length >= minLength) {
            onScan(barcodeRef.current);
          }
          barcodeRef.current = '';
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, onScan, minLength]);
};

export default useBarcodeScanner;
