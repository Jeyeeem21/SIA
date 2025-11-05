/**
 * Validation Utilities
 * Functions for validating email, phone, required fields, etc.
 */

// Email validation
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (flexible for different formats)
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's 10 or 11 digits
  return cleaned.length >= 10 && cleaned.length <= 11;
};

// Required field validation
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return !!value;
};

// Minimum length validation
export const minLength = (value, length) => {
  if (!value) return false;
  return value.toString().length >= length;
};

// Maximum length validation
export const maxLength = (value, length) => {
  if (!value) return true; // Empty is valid for max length
  return value.toString().length <= length;
};

// Number validation
export const isValidNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Positive number validation
export const isPositiveNumber = (value) => {
  return isValidNumber(value) && parseFloat(value) > 0;
};

// Integer validation
export const isInteger = (value) => {
  return isValidNumber(value) && Number.isInteger(parseFloat(value));
};

// URL validation
export const isValidURL = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Date validation
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Password strength validation
export const isStrongPassword = (password) => {
  if (!password) return false;
  
  // At least 8 characters, one uppercase, one lowercase, one number
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongRegex.test(password);
};

// Barcode validation (various formats)
export const isValidBarcode = (barcode) => {
  if (!barcode) return false;
  
  // Allow alphanumeric, minimum 4 characters
  return /^[A-Za-z0-9]{4,}$/.test(barcode);
};

// Price validation (positive number with max 2 decimals)
export const isValidPrice = (price) => {
  if (!isPositiveNumber(price)) return false;
  
  const priceStr = price.toString();
  const decimalPart = priceStr.split('.')[1];
  
  // Check max 2 decimal places
  return !decimalPart || decimalPart.length <= 2;
};

// Quantity validation
export const isValidQuantity = (quantity) => {
  return isInteger(quantity) && parseInt(quantity) >= 0;
};

// Validate form object against rules
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    // Required check
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.requiredMessage || `${field} is required`;
      return;
    }
    
    // Skip other validations if empty and not required
    if (!isRequired(value)) return;
    
    // Email check
    if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = fieldRules.emailMessage || 'Invalid email format';
      return;
    }
    
    // Phone check
    if (fieldRules.phone && !isValidPhone(value)) {
      errors[field] = fieldRules.phoneMessage || 'Invalid phone number';
      return;
    }
    
    // Min length check
    if (fieldRules.minLength && !minLength(value, fieldRules.minLength)) {
      errors[field] = fieldRules.minLengthMessage || `Minimum ${fieldRules.minLength} characters required`;
      return;
    }
    
    // Max length check
    if (fieldRules.maxLength && !maxLength(value, fieldRules.maxLength)) {
      errors[field] = fieldRules.maxLengthMessage || `Maximum ${fieldRules.maxLength} characters allowed`;
      return;
    }
    
    // Number check
    if (fieldRules.number && !isValidNumber(value)) {
      errors[field] = fieldRules.numberMessage || 'Must be a valid number';
      return;
    }
    
    // Custom validation
    if (fieldRules.custom && !fieldRules.custom(value)) {
      errors[field] = fieldRules.customMessage || 'Invalid value';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
