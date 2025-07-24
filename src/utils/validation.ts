/**
 * Comprehensive validation utilities for the application
 */

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

// Phone number validation (international format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 7;
};

// Image file validation
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image must be smaller than 10MB' };
  }

  // Check allowed formats
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { isValid: false, error: 'Please use JPG, PNG, GIF, or WebP format' };
  }

  return { isValid: true };
};

// Text input sanitization
export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    const urlObject = new URL(url);
    return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
  } catch {
    return false;
  }
};

// Date validation
export const validateEventDate = (date: string): { isValid: boolean; error?: string } => {
  const eventDate = new Date(date);
  const now = new Date();
  
  if (isNaN(eventDate.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  
  if (eventDate < now) {
    return { isValid: false, error: 'Event date must be in the future' };
  }
  
  // Check if date is within reasonable range (next 10 years)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  
  if (eventDate > maxDate) {
    return { isValid: false, error: 'Event date is too far in the future' };
  }
  
  return { isValid: true };
};

// Price validation
export const validatePrice = (price: number): { isValid: boolean; error?: string } => {
  if (isNaN(price) || price < 0) {
    return { isValid: false, error: 'Price must be a valid positive number' };
  }
  
  if (price > 1000000) {
    return { isValid: false, error: 'Price cannot exceed R1,000,000' };
  }
  
  return { isValid: true };
};

// Quantity validation
export const validateQuantity = (quantity: number, max: number = 10): { isValid: boolean; error?: string } => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { isValid: false, error: 'Quantity must be at least 1' };
  }
  
  if (quantity > max) {
    return { isValid: false, error: `Maximum ${max} tickets allowed` };
  }
  
  return { isValid: true };
};

// Event capacity validation
export const validateCapacity = (capacity: number): { isValid: boolean; error?: string } => {
  if (!Number.isInteger(capacity) || capacity < 1) {
    return { isValid: false, error: 'Capacity must be at least 1' };
  }
  
  if (capacity > 100000) {
    return { isValid: false, error: 'Capacity cannot exceed 100,000' };
  }
  
  return { isValid: true };
};

// Username validation
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeText(username);
  
  if (sanitized.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (sanitized.length > 20) {
    return { isValid: false, error: 'Username cannot exceed 20 characters' };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(sanitized)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  return { isValid: true };
};

// Generic string length validation
export const validateStringLength = (
  value: string, 
  minLength: number = 0, 
  maxLength: number = 1000,
  fieldName: string = 'Field'
): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeText(value);
  
  if (sanitized.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (sanitized.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true };
};

// Validate multiple fields at once
export const validateForm = (validations: Array<{ isValid: boolean; error?: string }>): { isValid: boolean; errors: string[] } => {
  const errors = validations
    .filter(validation => !validation.isValid)
    .map(validation => validation.error || 'Unknown error')
    .filter(Boolean);
    
  return {
    isValid: errors.length === 0,
    errors
  };
};