// Environment validation - Secure configuration without localStorage
export const SECURITY_CONSTANTS = {
  MAX_USERNAME_LENGTH: 15,
  MIN_USERNAME_LENGTH: 3,
  USERNAME_REGEX: /^[a-z0-9_.-]+$/,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  MAX_REQUEST_SIZE: 1024 * 1024, // 1MB for API requests
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

// Event Constants
export const EVENT_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_VENUE_LENGTH: 200,
  MIN_PRICE: 0,
  MAX_PRICE: 100_000,
  MAX_ATTENDEES: 10_000,
  MAX_TAGS: 10,
};

// Payment Constants
export const PAYMENT_CONSTANTS = {
  MIN_AMOUNT: 1, // R1 minimum
  MAX_AMOUNT: 50_000, // R50,000 maximum
  PROCESSING_FEE_PERCENTAGE: 2.9,
  FIXED_FEE_CENTS: 30,
};

// Rate Limiting Constants
export const RATE_LIMITS = {
  API_GENERAL: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 min
  AUTH: { requests: 5, window: 15 * 60 * 1000 }, // 5 auth requests per 15 min
  UPLOAD: { requests: 10, window: 15 * 60 * 1000 }, // 10 uploads per 15 min
  FORM_SUBMISSION: { requests: 20, window: 15 * 60 * 1000 }, // 20 forms per 15 min
};

// Secure Supabase configuration
export const SUPABASE_CONFIG = {
  URL: "https://yaihbkgojeuewdacmtje.supabase.co",
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaWhia2dvamV1ZXdkYWNtdGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzUxMTMsImV4cCI6MjA2NTc1MTExM30.SUEAIV1nq_3q6z6oir5SqNUAF5cmacu14-bZdqaDcvY"
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_PWA: true,
  ENABLE_REAL_TIME_CHAT: true,
  ENABLE_ADVANCED_ANALYTICS: false,
  ENABLE_SPLIT_PAYMENTS: true,
};

// API Keys configuration - these should be stored in Supabase secrets
export const REQUIRED_API_KEYS = [
  'YOCO_SECRET_KEY',
  'YOCO_PUBLIC_KEY', 
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'OPENAI_API_KEY',
  'GOOGLE_MAPS_API_KEY',
  'GOOGLE_ANALYTICS_ID',
  'GOOGLE_ANALYTICS_STREAM_ID',
  'SENDGRID_API_KEY',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_PHONE_NUMBER',
  'INTERCOM_APP_ID',
  'TERMLY_EMBED_ID',
  'SENTRY_DSN'
];

export const validateEnvironment = () => {
  if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
    throw new Error("Supabase configuration is missing");
  }
  
  // Additional validation for URL format
  try {
    new URL(SUPABASE_CONFIG.URL);
  } catch {
    throw new Error("Invalid Supabase URL format");
  }
};