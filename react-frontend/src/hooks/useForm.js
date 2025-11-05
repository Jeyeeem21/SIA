/**
 * useForm Hook
 * Reusable form state management and validation
 */

import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validators';

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle field blur (for validation)
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Set single field value
  const setFieldValue = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set multiple field values
  const setValues = useCallback((values) => {
    setFormData(prev => ({
      ...prev,
      ...values
    }));
  }, []);

  // Validate form
  const validate = useCallback(() => {
    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData, validationRules]);

  // Reset form
  const resetForm = useCallback((newValues = initialValues) => {
    setFormData(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Submit handler
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      if (e) e.preventDefault();
      
      setIsSubmitting(true);
      
      // Validate form
      const isValid = validate();
      
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }
      
      try {
        await onSubmit(formData);
        // Don't reset here - let the parent component decide
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [formData, validate]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setValues,
    resetForm,
    handleSubmit,
    validate,
    setIsSubmitting,
  };
};
