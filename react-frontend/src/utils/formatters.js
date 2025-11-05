/**
 * Formatter Utilities
 * Functions for formatting dates, currency, phone numbers, etc.
 */

// Format currency with PHP peso sign
export const formatCurrency = (amount, decimals = 2) => {
  if (amount === null || amount === undefined) return '₱0.00';
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return '₱0.00';
  return `₱${numAmount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

// Format date to MM/DD/YYYY
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Format time to 12-hour format
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  } catch (error) {
    return 'Invalid Time';
  }
};

// Format date and time together
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  return {
    date: formatDate(dateString),
    time: formatTime(dateString),
    full: `${formatDate(dateString)} ${formatTime(dateString)}`
  };
};

// Format phone number (simple version)
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format as +XX XXX XXX XXXX if 11+ digits
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  return phone;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '0%';
  return `${numValue.toFixed(decimals)}%`;
};

// Pluralize word
export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};
