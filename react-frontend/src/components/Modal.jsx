import React from 'react';
import { createPortal } from 'react-dom';
import { XCircle } from 'lucide-react';

/**
 * UNIFIED MODAL COMPONENT
 *
 * A reusable modal component with consistent design across the entire application.
 */

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  icon,
  headerGradient = 'from-cyan-600 to-teal-600',
  noPadding = false
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalMarkup = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* inner padding kept on the inner wrapper (not the overlay) to avoid overlay being inset by ancestor styles */}
      <div className="w-full px-4">
        <div className={`mx-auto bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
          {/* Modal Header */}
          <div className={`sticky top-0 bg-gradient-to-r ${headerGradient} text-white p-6 rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="flex-shrink-0">{icon}</div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{title}</h2>
                  {subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
                </div>
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                  type="button"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Modal Body */}
          <div className={noPadding ? '' : 'p-6'}>{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
};

export default Modal;
