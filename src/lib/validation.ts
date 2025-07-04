// Enhanced validation utilities with security improvements
import { z } from "zod";

/**
 * Strong password validation schema.
 * At least 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 special char.
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character"
  );

/**
 * Email validation schema.
 */
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(254, "Email address is too long");

/**
 * Enhanced input sanitization.
 * Removes HTML, JS, and suspicious patterns.
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data URLs
    .replace(/vbscript:/gi, "") // Remove vbscript
    .replace(/expression\(/gi, "") // Remove CSS expressions
    .trim();
};

/**
 * File upload validation.
 */
export const validateFileUpload = (
  file: File
): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

  if (file.size > maxSize) {
    return { isValid: false, error: "File size must be less than 10MB" };
  }
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Only JPEG, PNG, GIF, and WebP images are allowed",
    };
  }
  if (!allowedExtensions.test(file.name)) {
    return { isValid: false, error: "Invalid file extension" };
  }
  // Check for double extensions
  if ((file.name.match(/\./g) || []).length > 1) {
    return {
      isValid: false,
      error: "Files with multiple extensions are not allowed",
    };
  }
  return { isValid: true };
};

/**
 * Username validation schema.
 */
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must be less than 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens"
  );

/**
 * Auth form validation schema.
 */
export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long")
    .transform(sanitizeInput),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long")
    .transform(sanitizeInput),
});

/**
 * Event form validation schema.
 */
export const eventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .transform(sanitizeInput),
  description: z
    .string()
    .max(2000, "Description is too long")
    .transform(sanitizeInput),
  venue: z
    .string()
    .min(1, "Venue is required")
    .max(200, "Venue is too long")
    .transform(sanitizeInput),
  address: z.string().max(300, "Address is too long").transform(sanitizeInput),
  category: z.string().min(1, "Category is required").transform(sanitizeInput),
  price: z.number().min(0, "Price must be positive"),
  maxAttendees: z
    .number()
    .min(1, "Must allow at least 1 attendee")
    .max(10000, "Maximum attendees limit exceeded"),
});
/**
 * Secure CSP header for enhanced security.
 * Allows scripts and styles from trusted sources, blocks inline scripts unless they have a valid nonce.
 */
