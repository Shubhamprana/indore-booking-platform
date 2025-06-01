# FastBookr Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project
- Gmail account with app password for SMTP
- Domain name and hosting platform (Vercel, Netlify, etc.)

### 1. Environment Configuration

Create a `.env.local` file (or set environment variables in your hosting platform):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration  
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=FastBookr
NEXT_PUBLIC_APP_DESCRIPTION=Skip the Wait, Book Instantly

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_random_string

# Email Configuration
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Environment
NODE_ENV=production
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Set up the required tables and RLS policies
3. Configure authentication providers
4. Update your environment variables

### 3. Gmail SMTP Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password for SMTP
3. Use the app password in `SMTP_PASSWORD` environment variable

### 4. Build and Deploy

#### For Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### For Netlify:
```bash
# Build the project
npm run build

# Deploy to Netlify (drag and drop the .next folder)
```

#### For other platforms:
```bash
# Build the project
npm run build

# Start production server
npm start
```

### 5. Performance Optimizations

✅ **Completed Optimizations:**
- Bundle splitting and code optimization
- Image optimization with WebP/AVIF support
- Email service connection pooling
- Aggressive caching for static assets
- Security headers implementation
- Console.log removal in production
- Source map disabled for security

### 6. Monitoring and Analytics

- Set up error monitoring (Sentry recommended)
- Configure performance monitoring
- Set up uptime monitoring
- Enable analytics if desired

### 7. Security Checklist

✅ **Security Features:**
- HTTPS enforced
- Security headers configured
- XSS protection enabled
- Content Security Policy implemented
- Secure authentication flow
- Input validation and sanitization
- Environment variables properly secured

### 8. Email System

✅ **Email Features:**
- Welcome emails for new users
- Reward notifications
- Contact form emails
- Professional HTML templates
- Mobile-responsive design
- Connection pooling for performance

### 9. Features Ready for Production

✅ **Core Features:**
- User authentication and registration
- Profile management
- Business dashboard
- Referral system with rewards
- Email notifications
- Mobile-responsive design
- SEO optimization

### 10. Post-Deployment Tasks

1. **DNS Configuration**: Point your domain to your hosting platform
2. **SSL Certificate**: Ensure HTTPS is properly configured
3. **Database Backups**: Set up regular Supabase backups
4. **Monitoring**: Configure uptime and performance monitoring
5. **Testing**: Run end-to-end tests on production environment

### 11. Environment Variables for Production

For hosting platforms like Vercel, Netlify, or Railway, set these environment variables in your platform's dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SMTP_EMAIL`
- `SMTP_PASSWORD`
- `NODE_ENV=production`

### 12. Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Development mode
npm run dev
```

### 13. Troubleshooting

**Common Issues:**
1. **Email not sending**: Check SMTP credentials and Gmail app password
2. **Supabase connection**: Verify URL and anon key
3. **Build failures**: Check for TypeScript errors and missing dependencies
4. **Performance issues**: Enable compression and check bundle size

### 14. Performance Metrics

**Target Metrics:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

### 15. Maintenance

**Regular Tasks:**
- Update dependencies monthly
- Monitor error logs
- Check email delivery rates
- Review performance metrics
- Update content and features

---

## 🎉 Deployment Complete!

Your FastBookr platform is now ready for production with:
- ✅ Professional email system
- ✅ Secure authentication
- ✅ Optimized performance
- ✅ Mobile-responsive design
- ✅ Production-ready configuration

For support or questions, refer to the documentation or contact the development team. 