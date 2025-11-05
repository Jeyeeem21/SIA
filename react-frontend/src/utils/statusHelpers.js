/**
 * Status Helper Utilities
 * Centralized functions for status badge styling and text
 */

// Generic status color mapping
export const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || '';
  
  const statusMap = {
    // Common statuses
    'active': 'bg-teal-100 text-teal-700 border-teal-200',
    'inactive': 'bg-slate-100 text-slate-700 border-slate-200',
    'pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'completed': 'bg-teal-100 text-teal-700 border-teal-200',
    'cancelled': 'bg-red-100 text-red-700 border-red-200',
    'in progress': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    
    // Inventory statuses
    'in stock': 'bg-teal-100 text-teal-700 border-teal-200',
    'low stock': 'bg-amber-100 text-amber-700 border-amber-200',
    'out of stock': 'bg-red-100 text-red-700 border-red-200',
    
    // Payment statuses
    'paid': 'bg-teal-100 text-teal-700 border-teal-200',
    'unpaid': 'bg-red-100 text-red-700 border-red-200',
    'partial': 'bg-amber-100 text-amber-700 border-amber-200',
    'overdue': 'bg-rose-100 text-rose-700 border-rose-200',
  };
  
  return statusMap[statusLower] || 'bg-slate-100 text-slate-700 border-slate-200';
};

// Get status badge component (for inventory, etc.)
export const getStatusBadge = (status) => {
  const statusLower = status?.toLowerCase() || '';
  
  let badgeClass = '';
  let text = status;
  
  switch(statusLower) {
    case 'in stock':
      badgeClass = 'px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 border border-teal-200';
      text = 'In Stock';
      break;
    case 'low stock':
      badgeClass = 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200';
      text = 'Low Stock';
      break;
    case 'out of stock':
      badgeClass = 'px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200';
      text = 'Out of Stock';
      break;
    default:
      badgeClass = 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200';
  }
  
  return <span className={badgeClass}>{text}</span>;
};

// Get status text (capitalize properly)
export const getStatusText = (status) => {
  if (!status) return 'Unknown';
  
  const statusLower = status.toLowerCase();
  const statusMap = {
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'in progress': 'In Progress',
    'in stock': 'In Stock',
    'low stock': 'Low Stock',
    'out of stock': 'Out of Stock',
    'paid': 'Paid',
    'unpaid': 'Unpaid',
    'partial': 'Partial',
    'overdue': 'Overdue',
  };
  
  return statusMap[statusLower] || status;
};

// Get type color (for customers, etc.)
export const getTypeColor = (type) => {
  const typeLower = type?.toLowerCase() || '';
  
  const typeMap = {
    'student': 'bg-blue-100 text-blue-700 border-blue-200',
    'faculty': 'bg-purple-100 text-purple-700 border-purple-200',
    'staff': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'guest': 'bg-slate-100 text-slate-700 border-slate-200',
  };
  
  return typeMap[typeLower] || 'bg-slate-100 text-slate-700 border-slate-200';
};

// Get account status color
export const getAccountStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower === 'active') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  } else if (statusLower === 'inactive') {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }
  
  return 'bg-slate-100 text-slate-700 border-slate-200';
};
