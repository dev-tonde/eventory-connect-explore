
// Security Constants
export const SECURITY_CONSTANTS = {
  MAX_USERNAME_LENGTH: 15,
  MIN_USERNAME_LENGTH: 3,
  USERNAME_REGEX: /^[a-z0-9_.-]+$/,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_REQUEST_SIZE: 1024 * 1024, // 1MB for API requests
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

// Event Constants
export const EVENT_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_VENUE_LENGTH: 200,
  MIN_PRICE: 0,
  MAX_PRICE: 100000,
  MAX_ATTENDEES: 10000,
  MAX_TAGS: 10,
};

// Payment Constants
export const PAYMENT_CONSTANTS = {
  MIN_AMOUNT: 1, // R1 minimum
  MAX_AMOUNT: 50000, // R50,000 maximum
  PROCESSING_FEE_PERCENTAGE: 2.9,
  FIXED_FEE_CENTS: 30,
};

// Rate Limiting Constants
export const RATE_LIMITS = {
  API_GENERAL: { requests: 100, window: 15 * 60 * 1000 },
  AUTH: { requests: 5, window: 15 * 60 * 1000 },
  UPLOAD: { requests: 10, window: 15 * 60 * 1000 },
  FORM_SUBMISSION: { requests: 20, window: 15 * 60 * 1000 },
};

// Environment validation
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = requiredEnvVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_PWA: true,
  ENABLE_REAL_TIME_CHAT: true,
  ENABLE_ADVANCED_ANALYTICS: false,
  ENABLE_SPLIT_PAYMENTS: true,
};
