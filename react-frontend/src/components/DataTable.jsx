/**
 * DataTable Component
 * Reusable table with responsive mobile/desktop views
 */

import { Eye, Edit, Trash2 } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found',
  onView = null,
  onEdit = null,
  onDelete = null,
  renderMobileCard = null, // Custom mobile card renderer
  keyField = 'id',
  className = '',
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-slate-500 py-12">
        <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">{emptyMessage}</div>
    );
  }

  // Default mobile card if not provided
  const defaultMobileCard = (item) => (
    <div key={item[keyField]} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
      {columns.slice(0, -1).map((column, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span className="text-slate-600">{column.header}:</span>
          <span className="font-medium text-slate-900">
            {column.render ? column.render(item) : item[column.key]}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
        {onView && (
          <button
            onClick={() => onView(item)}
            className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="flex-1 px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(item)}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden p-4 space-y-4">
        {data.map((item) => 
          renderMobileCard ? renderMobileCard(item) : defaultMobileCard(item)
        )}
      </div>

      {/* Desktop Table View */}
      <div className={`hidden md:block overflow-x-auto ${className}`}>
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                    column.align === 'right' ? 'text-right' : 
                    column.align === 'center' ? 'text-center' : 
                    'text-left'
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((item) => (
              <tr key={item[keyField]} className="hover:bg-slate-50 transition-colors">
                {columns.map((column, idx) => (
                  <td
                    key={idx}
                    className={`px-6 py-4 ${
                      column.align === 'right' ? 'text-right' : 
                      column.align === 'center' ? 'text-center' : 
                      'text-left'
                    }`}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DataTable;
