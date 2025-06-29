
# Third-Party APIs and Services Configuration

This document lists all the third-party APIs and services used in the platform that require API keys, secrets, or configuration.

## Required API Keys and Secrets

### 1. **Supabase** (Already Configured)
- **Service**: Backend database and authentication
- **Required Keys**:
  - Project URL: `https://yaihbkgojeuewdacmtje.supabase.co` ✅
  - Anon Key: Already configured ✅
  - Service Role Key: Already configured ✅
- **Status**: ✅ Fully configured and working

### 2. **OpenAI API** (Optional - For AI Features) 
- **Service**: AI-powered poster generation and chat features
- **Required Keys**:
  - `OPENAI_API_KEY`: Your OpenAI API key
- **Where to get**: https://platform.openai.com/api-keys
- **Used in**: 
  - AI poster generation (`/poster-studio`)
  - Future AI chat features
- **Status**: ⚠️ Required if using AI features

### 3. **Yoco Payments** (For Payment Processing)
- **Service**: South African payment processing
- **Required Keys**:
  - `YOCO_PUBLIC_KEY`: Your Yoco public key ✅
  - `YOCO_SECRET_KEY`: Your Yoco secret key ✅
- **Where to get**: https://developer.yoco.com/
- **Used in**: 
  - Ticket purchases
  - Split payments
- **Status**: ✅ Keys configured (verify they're valid)

### 4. **Google OAuth** (For Social Login)
- **Service**: Google sign-in authentication
- **Required Keys**:
  - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID ✅
  - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret ✅
- **Where to get**: https://console.developers.google.com/
- **Configuration needed**:
  - Add your domain to authorized origins
  - Add redirect URLs to Google Console
- **Status**: ✅ Keys configured (verify OAuth settings)

## Optional Services (Not Currently Required)

### 5. **Email Service** (Future Enhancement)
- **Service**: Email notifications and marketing
- **Options**: 
  - SendGrid
  - Mailgun
  - AWS SES
- **Status**: 🔄 Not implemented yet

### 6. **SMS Service** (Future Enhancement)
- **Service**: SMS notifications
- **Options**:
  - Twilio
  - AWS SNS
- **Status**: 🔄 Not implemented yet

### 7. **File Storage** (Future Enhancement)
- **Service**: Event image uploads and storage
- **Options**:
  - AWS S3
  - Cloudinary
  - Supabase Storage
- **Status**: 🔄 Currently using placeholder images

### 8. **Maps Service** (Future Enhancement)
- **Service**: Event location mapping
- **Options**:
  - Google Maps API
  - Mapbox
- **Status**: 🔄 Not implemented yet

### 9. **Analytics** (Future Enhancement)
- **Service**: User analytics and tracking
- **Options**:
  - Google Analytics
  - Mixpanel
  - Posthog
- **Status**: 🔄 Not implemented yet

## Current Platform Status

### ✅ Working Features
- User authentication (email/password + Google OAuth)
- Event browsing and details
- Community creation and management
- Profile management with username restrictions
- Basic event search and filtering

### ⚠️ Features Requiring API Keys
- AI poster generation (requires OpenAI API key)
- Payment processing (Yoco keys configured but need verification)

### 🔄 Future Enhancements
- Email notifications
- SMS notifications  
- File upload for event images
- Maps integration
- Advanced analytics

## Setup Instructions

1. **Verify Yoco Integration**: Test payment processing with your Yoco sandbox/live keys
2. **Google OAuth Setup**: Ensure your domain is whitelisted in Google Console
3. **OpenAI (Optional)**: Add OpenAI API key if you want AI poster generation
4. **Test All Integrations**: Verify each service works with your keys

## Security Notes

- All API keys are stored as Supabase secrets (secure)
- Never expose secret keys in client-side code
- Regularly rotate API keys for security
- Monitor API usage and billing for each service
