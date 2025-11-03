import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, title, message, itemName, onConfirm }) => {
  const handleDelete = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {message || 'Are you sure?'}
        </h3>
        
        {itemName && (
          <p className="text-sm text-gray-500 mb-4">
            You are about to delete <strong className="text-gray-900">{itemName}</strong>. 
            This action cannot be undone.
          </p>
        )}
      </div>

      <div className="flex justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default DeleteModal;
