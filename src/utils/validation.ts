
import { SECURITY_CONSTANTS, PAYMENT_CONSTANTS, EVENT_CONSTANTS } from "@/lib/constants";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Password must contain uppercase, lowercase, and number" };
  }
  return { isValid: true };
};

export const validateEventData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title || data.title.length > EVENT_CONSTANTS.MAX_TITLE_LENGTH) {
    errors.push(`Title is required and must be under ${EVENT_CONSTANTS.MAX_TITLE_LENGTH} characters`);
  }

  if (data.description && data.description.length > EVENT_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be under ${EVENT_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.price < EVENT_CONSTANTS.MIN_PRICE || data.price > EVENT_CONSTANTS.MAX_PRICE) {
    errors.push(`Price must be between R${EVENT_CONSTANTS.MIN_PRICE} and R${EVENT_CONSTANTS.MAX_PRICE}`);
  }

  if (!data.date || new Date(data.date) <= new Date()) {
    errors.push("Event date must be in the future");
  }

  return { isValid: errors.length === 0, errors };
};

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};
