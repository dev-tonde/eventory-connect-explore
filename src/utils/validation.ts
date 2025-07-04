import {
  SECURITY_CONSTANTS,
  PAYMENT_CONSTANTS,
  EVENT_CONSTANTS,
} from "@/lib/constants";

/**
 * Validates an email address using a basic regex.
 */
export const validateEmail = (email: string): boolean => {
  // RFC 5322 compliant regex is more complex, but this covers most cases.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength.
 * - At least 8 characters
 * - Contains uppercase, lowercase, and a number
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain uppercase, lowercase, and number",
    };
  }
  // Optionally: check for special characters, common passwords, etc.
  return { isValid: true };
};

/**
 * Validates event data for creation or update.
 */
type EventData = {
  title: string;
  description?: string;
  price: number;
  date: string;
  location?: string; // Optional, can be a string or an object
  category?: string; // Optional, can be a string or an object
  image?: string; // Optional, URL to event image
  organizer?: string; // Optional, can be a string or an object
  attendeeCount?: number; // Optional, for existing events
  maxAttendees?: number; // Optional, for existing events
  tags?: string[]; // Optional, array of tags
};

export const validateEventData = (
  data: EventData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (
    !data.title ||
    typeof data.title !== "string" ||
    data.title.length > EVENT_CONSTANTS.MAX_TITLE_LENGTH
  ) {
    errors.push(
      `Title is required and must be under ${EVENT_CONSTANTS.MAX_TITLE_LENGTH} characters`
    );
  }

  if (
    data.description &&
    (typeof data.description !== "string" ||
      data.description.length > EVENT_CONSTANTS.MAX_DESCRIPTION_LENGTH)
  ) {
    errors.push(
      `Description must be under ${EVENT_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters`
    );
  }

  if (
    typeof data.price !== "number" ||
    data.price < EVENT_CONSTANTS.MIN_PRICE ||
    data.price > EVENT_CONSTANTS.MAX_PRICE
  ) {
    errors.push(
      `Price must be between R${EVENT_CONSTANTS.MIN_PRICE} and R${EVENT_CONSTANTS.MAX_PRICE}`
    );
  }

  if (
    !data.date ||
    isNaN(Date.parse(data.date)) ||
    new Date(data.date) <= new Date()
  ) {
    errors.push("Event date must be a valid date in the future");
  }

  // Add more validation as needed (e.g., location, category, etc.)

  return { isValid: errors.length === 0, errors };
};

/**
 * Sanitizes HTML input to prevent XSS attacks.
 * This is a basic implementation; for production use a library like DOMPurify.
 */
export const sanitizeHtml = (input: string): string => {
  // Remove tags and dangerous attributes
  return input
    .replace(/<[^>]*>?/gm, "") // Remove all HTML tags
    .replace(/javascript:/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .trim();
};
