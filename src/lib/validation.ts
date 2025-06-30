
// Enhanced validation utilities with security improvements
import { z } from "zod";

// Strong password validation schema
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// Email validation schema
export const emailSchema = z.string()
  .email("Please enter a valid email address")
  .max(254, "Email address is too long");

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data URLs
    .replace(/vbscript:/gi, '') // Remove vbscript
    .replace(/expression\(/gi, '') // Remove CSS expressions
    .trim();
};

// File upload validation
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }

  if (!allowedExtensions.test(file.name)) {
    return { isValid: false, error: 'Invalid file extension' };
  }

  // Check for double extensions
  if ((file.name.match(/\./g) || []).length > 1) {
    return { isValid: false, error: 'Files with multiple extensions are not allowed' };
  }

  return { isValid: true };
};

// Username validation
export const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must be less than 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens");

// Form validation schemas
export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000, "Description is too long"),
  venue: z.string().min(1, "Venue is required").max(200),
  address: z.string().max(300),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be positive"),
  maxAttendees: z.number().min(1, "Must allow at least 1 attendee").max(10000),
});
