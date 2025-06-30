
// Enhanced security validation utilities
import { z } from "zod";

// Strong password validation schema with security requirements
export const securePasswordSchema = z.string()
  .min(12, "Password must be at least 12 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
  .refine((password) => {
    // Check for common weak patterns
    const weakPatterns = [
      /^(.)\1+$/, // All same character
      /^(password|123456|qwerty)/i, // Common weak passwords
      /^(.{1,2})\1+$/ // Repeated short patterns
    ];
    return !weakPatterns.some(pattern => pattern.test(password));
  }, "Password contains weak patterns");

// Enhanced email validation with security checks
export const secureEmailSchema = z.string()
  .email("Please enter a valid email address")
  .max(254, "Email address is too long")
  .refine((email) => {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:/i
    ];
    return !suspiciousPatterns.some(pattern => pattern.test(email));
  }, "Email contains invalid characters");

// Comprehensive input sanitization with XSS protection
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data URLs
    .replace(/vbscript:/gi, '') // Remove vbscript
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/&#/g, '') // Remove HTML entities
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .slice(0, 1000); // Limit length to prevent buffer overflow attempts
};

// SQL injection prevention for search terms
export const sanitizeSearchTerm = (term: string): string => {
  if (typeof term !== 'string') {
    return '';
  }

  return term
    .replace(/['"`;\\]/g, '') // Remove SQL dangerous characters
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '') // Remove SQL keywords
    .trim()
    .slice(0, 100); // Limit search term length
};

// Enhanced file upload validation with security checks
export const validateSecureFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB (reduced from 10MB for security)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

  // File size validation
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // MIME type validation
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }

  // File extension validation
  if (!allowedExtensions.test(file.name)) {
    return { isValid: false, error: 'Invalid file extension' };
  }

  // Check for double extensions (potential bypass attempt)
  const extensionCount = (file.name.match(/\./g) || []).length;
  if (extensionCount > 1) {
    return { isValid: false, error: 'Files with multiple extensions are not allowed' };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|jsp)$/i,
    /\x00/, // Null bytes
    /../, // Path traversal
    /[<>:"|?*]/ // Invalid filename characters
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    return { isValid: false, error: 'File name contains invalid characters' };
  }

  // File name length check
  if (file.name.length > 255) {
    return { isValid: false, error: 'File name is too long' };
  }

  return { isValid: true };
};

// URL validation with security checks
export const validateSecureUrl = (url: string): { isValid: boolean; error?: string } => {
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Block localhost and private IP ranges in production
    const hostname = urlObj.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '10.',
      '172.',
      '192.168.'
    ];

    if (import.meta.env.PROD && blockedHosts.some(blocked => hostname.includes(blocked))) {
      return { isValid: false, error: 'Private network URLs are not allowed' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// Phone number validation (international format)
export const phoneSchema = z.string()
  .regex(/^\+[1-9]\d{1,14}$/, "Please enter a valid international phone number (e.g., +1234567890)")
  .min(8, "Phone number is too short")
  .max(16, "Phone number is too long");

// Username validation with security constraints
export const secureUsernameSchema = z.string()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must be less than 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
  .refine((username) => {
    // Block admin-like usernames
    const blockedUsernames = [
      'admin', 'administrator', 'root', 'system', 'user',
      'test', 'demo', 'null', 'undefined', 'support'
    ];
    return !blockedUsernames.includes(username.toLowerCase());
  }, "Username is not available");

// Enhanced form validation schemas
export const secureAuthSchema = z.object({
  email: secureEmailSchema,
  password: securePasswordSchema,
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name is too long")
    .transform(sanitizeInput),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long")
    .transform(sanitizeInput),
});

export const secureEventSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .transform(sanitizeInput),
  description: z.string()
    .max(2000, "Description is too long")
    .transform(sanitizeInput),
  venue: z.string()
    .min(1, "Venue is required")
    .max(200, "Venue name is too long")
    .transform(sanitizeInput),
  address: z.string()
    .max(300, "Address is too long")
    .transform(sanitizeInput),
  category: z.string()
    .min(1, "Category is required")
    .transform(sanitizeInput),
  price: z.number()
    .min(0, "Price must be positive")
    .max(50000, "Price is too high"),
  maxAttendees: z.number()
    .min(1, "Must allow at least 1 attendee")
    .max(10000, "Maximum attendees limit exceeded"),
});

// Rate limiting validation
export const checkRateLimit = (
  identifier: string,
  action: string,
  limit: number = 5,
  windowMs: number = 60000
): boolean => {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  
  // Get stored data from sessionStorage (client-side rate limiting)
  const stored = sessionStorage.getItem(key);
  
  if (!stored) {
    sessionStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
    return true;
  }
  
  try {
    const data = JSON.parse(stored);
    
    if (now > data.resetTime) {
      sessionStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }
    
    if (data.count >= limit) {
      return false;
    }
    
    data.count++;
    sessionStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    // If parsing fails, reset
    sessionStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
    return true;
  }
};

// Content Security Policy header validation
export const validateCSPHeader = (nonce: string): string => {
  // Generate a secure CSP header with nonce
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://js.yoco.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://yaihbkgojeuewdacmtje.supabase.co wss://yaihbkgojeuewdacmtje.supabase.co https://online.yoco.com",
    "media-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};
