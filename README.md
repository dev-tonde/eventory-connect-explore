
# Eventory - Event Management Platform

A comprehensive event management platform built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Core Features
- **Event Management**: Create, manage, and discover events
- **User Authentication**: Secure signup/login with Supabase Auth
- **Profile Management**: User profiles with customizable usernames
- **Ticket System**: Purchase and manage event tickets
- **Notifications**: Real-time notifications and PWA support
- **Security**: Comprehensive security measures and monitoring

### Security Features
- ✅ HTTPS enforced everywhere
- ✅ Content Security Policy (CSP) headers
- ✅ Row Level Security (RLS) on all database tables
- ✅ Rate limiting on all endpoints
- ✅ Input validation and sanitization
- ✅ Error logging and monitoring
- ✅ Automated security scanning

### Scalability Features
- ✅ Serverless architecture (Vercel + Supabase)
- ✅ Database indexing for performance
- ✅ Rate limiting and DDoS protection
- ✅ Object storage for images/files
- ✅ Monitoring and observability
- ✅ Progressive Web App (PWA)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Security**: CSP headers, Rate limiting, RLS policies
- **Monitoring**: Error logging, Performance tracking

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🏗️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Run the provided SQL migrations in your Supabase project
   - Ensure RLS is enabled on all tables
   - Verify all indexes are created

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔒 Security Checklist

### Pre-Deployment Security Audit

- [ ] **HTTPS**: Enforced everywhere (handled by Vercel)
- [ ] **CSP Headers**: Content Security Policy configured
- [ ] **Supabase RLS**: Enabled on ALL user data tables
- [ ] **Auth Validation**: Server-side auth checks on all mutations
- [ ] **Input Validation**: Zod validation on client and server
- [ ] **Rate Limiting**: API endpoints protected from abuse
- [ ] **Environment Variables**: Secrets never exposed to client
- [ ] **Error Handling**: No sensitive data in error responses
- [ ] **Dependencies**: Run `npm audit` and fix critical issues
- [ ] **CORS**: Restricted to allowed domains only

### Database Security

- [ ] **RLS Policies**: Every table with user data has proper RLS
- [ ] **Indexes**: All filterable/sortable fields are indexed
- [ ] **Backups**: Automated backups enabled in Supabase
- [ ] **Migrations**: All schema changes tracked in version control

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Connect your GitHub repository to Vercel
   - Vercel will auto-detect Next.js configuration

2. **Environment Variables**
   Set in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Domain Configuration**
   - Configure custom domain in Vercel
   - Update Supabase auth URLs to match production domain

### Supabase Configuration

1. **Authentication URLs**
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: Include both staging and production URLs

2. **Storage Policies**
   - Configure storage bucket policies for public assets
   - Ensure authenticated uploads only

## 📊 Monitoring & Observability

### Error Monitoring
- All errors logged to Supabase `error_logs` table
- Real-time error tracking in production
- Performance metrics collection

### Security Monitoring
- Rate limit violations tracked
- Suspicious activity detection
- Admin dashboard for security events

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database query performance

## 🔧 Development Guidelines

### Code Organization
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── middleware/         # Security and rate limiting
├── utils/              # Helper functions
└── types/              # TypeScript type definitions
```

### Component Guidelines
- Keep components small and focused
- Use TypeScript for all components
- Implement proper error boundaries
- Follow accessibility best practices

### Security Guidelines
- Never trust client-side data
- Always validate inputs server-side
- Use parameterized queries (handled by Supabase)
- Implement proper rate limiting
- Log security events

## 📈 Scaling Considerations

### Performance Optimization
- Database queries optimized with proper indexes
- Image optimization and CDN usage
- Code splitting and lazy loading
- Service worker for caching

### Infrastructure Scaling
- Serverless architecture scales automatically
- Database connection pooling via Supabase
- Static asset CDN via Vercel
- Global edge deployment

## 🧪 Testing

### Test Coverage Areas
- Authentication flows
- Database RLS policies
- API rate limiting
- Security headers
- Form validation
- Error handling

### Running Tests
```bash
npm run test              # Unit tests
npm run test:e2e         # End-to-end tests
npm run audit            # Security audit
```

## 🚨 Troubleshooting

### Common Issues

1. **Auth Redirect Errors**
   - Verify Site URL and Redirect URLs in Supabase
   - Check CORS configuration

2. **Database Permission Errors**
   - Verify RLS policies are correct
   - Check user authentication state

3. **Rate Limiting Issues**
   - Check rate limit configuration
   - Verify legitimate users aren't blocked

## 📞 Support

For technical support or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check Vercel deployment logs

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Review security logs
- [ ] Monthly: Update dependencies (`npm audit`)
- [ ] Monthly: Review and rotate API keys
- [ ] Quarterly: Performance audit
- [ ] Quarterly: Security penetration testing

### Monitoring Alerts
Set up alerts for:
- High error rates (>5% of requests)
- Rate limit threshold breaches
- Database performance issues
- Security events

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
