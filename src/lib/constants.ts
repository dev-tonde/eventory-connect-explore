
// Application constants for security and configuration
export const SECURITY_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  RATE_LIMIT_DEFAULTS: {
    FORM_SUBMISSION: 5,
    API_CALLS: 100,
    WINDOW_MINUTES: 60
  }
};

export const PAYMENT_CONSTANTS = {
  CURRENCY: 'ZAR',
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 100000,
  SUPPORTED_METHODS: ['yoco', 'split']
};

export const EVENT_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_ATTENDEES_DEFAULT: 100,
  MIN_PRICE: 0,
  MAX_PRICE: 50000
};
