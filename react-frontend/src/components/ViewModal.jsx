import React from 'react';
import Modal from './Modal';

const ViewModal = ({ isOpen, onClose, title, data, fields }) => {
  if (!data) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="border-b border-gray-200 pb-3">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              {field.label}
            </label>
            <div className="text-base text-gray-900">
              {field.type === 'file' && data[field.key] ? (
                <img src={data[field.key]} alt={field.label} className="h-40 w-40 object-cover rounded-lg border border-gray-300" />
              ) : field.render ? (
                field.render(data[field.key])
              ) : (
                data[field.key] || 'N/A'
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ViewModal;
