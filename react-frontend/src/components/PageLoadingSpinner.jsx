import React from 'react';

/**
 * Unified Page Loading Spinner Component
 * 
 * Usage:
 * - For mobile/desktop cards: <PageLoadingSpinner />
 * - For tables: <PageLoadingSpinner variant="table" colSpan={6} />
 */
const PageLoadingSpinner = ({ 
  message = 'Loading...', 
  variant = 'default',
  colSpan = 5
}) => {
  // Table row variant (for use inside <tbody>)
  if (variant === 'table') {
    return (
      <tr>
        <td colSpan={colSpan} className="px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            <span>{message}</span>
          </div>
        </td>
      </tr>
    );
  }

  // Default variant (for cards, divs, general use)
  return (
    <div className="flex items-center justify-center gap-2 text-slate-500 py-12">
      <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
      <span>{message}</span>
    </div>
  );
};

export default PageLoadingSpinner;
