import React from 'react';
import { XCircle } from 'lucide-react';

/**
 * UNIFIED MODAL COMPONENT
 * 
 * A reusable modal component with consistent design across the entire application.
 * 
 * Design Standards:
 * - Backdrop: bg-black/50 backdrop-blur-sm
 * - Container: bg-white rounded-2xl shadow-2xl
 * - Header: Gradient (cyan-to-teal) with white text
 * - Close button: XCircle icon with hover effect
 * - Max height: 90vh with overflow-y-auto
 * - Responsive: Adapts to mobile and desktop
 * 
 * Usage:
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Modal Title"
 *   subtitle="Optional subtitle"
 *   size="md"
 *   icon={<Building2 className="w-6 h-6" />}
 * >
 *   <div>Your modal content here</div>
 * </Modal>
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

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
        {/* Modal Header */}
        <div className={`sticky top-0 bg-gradient-to-r ${headerGradient} text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex-shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle && (
                  <p className="text-white/80 text-sm mt-1">{subtitle}</p>
                )}
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
        <div className={noPadding ? '' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
