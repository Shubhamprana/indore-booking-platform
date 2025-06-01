# 📅 FastBookr - Skip the Wait, Book Instantly

A modern, production-ready booking platform built with Next.js 15, Supabase, and TypeScript. FastBookr enables seamless booking experiences for restaurants, salons, and other service providers.

## ✨ Features

### 🎯 Core Features
- **User Authentication**: Secure sign-up/login with email and phone
- **Business Dashboard**: Comprehensive management tools for service providers
- **Referral System**: Reward-based referral program with milestone tracking
- **Email Notifications**: Professional welcome emails and reward notifications
- **Profile Management**: User profiles with booking history and preferences
- **Mobile Responsive**: Optimized for all devices and screen sizes

### 📧 Email System
- **Welcome Emails**: Personalized onboarding emails for new users
- **Reward Notifications**: Automated emails for points, credits, and achievements
- **Contact Form**: Professional contact form with email integration
- **HTML Templates**: Beautiful, mobile-responsive email designs

### 🏆 Rewards & Gamification
- **Points System**: Earn points for activities and bookings
- **Credits Wallet**: Monetary credits for discounts and rewards
- **Achievement System**: Unlock achievements and badges
- **Referral Bonuses**: Earn rewards for successful referrals
- **Business Subscriptions**: Pro features for business users

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Gmail account with app password

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/fastbookr.git
cd fastbookr
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp env.production.example .env.local
# Edit .env.local with your configuration
```

4. **Run development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

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
```

### Supabase Setup

1. Create a new Supabase project
2. Set up authentication providers
3. Create required tables and RLS policies
4. Update environment variables

### Gmail SMTP Setup

1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `SMTP_PASSWORD`

## 📦 Build & Deploy

### Development
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server
npm run analyze      # Analyze bundle size
```

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Deploy the .next folder
```

#### Docker
```bash
docker build -t fastbookr .
docker run -p 3000:3000 fastbookr
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Vercel/Netlify ready

### Project Structure
```
fastbookr/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── (auth)/         # Authentication pages
│   └── ...pages        # Application pages
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components
│   └── ...            # Feature components
├── lib/               # Utilities and services
│   ├── auth.ts        # Authentication logic
│   ├── supabase.ts    # Supabase client
│   ├── email-service.ts # Email services
│   └── ...            # Other utilities
├── hooks/             # Custom React hooks
└── public/            # Static assets
```

## 🎨 UI Components

Built with Radix UI and Tailwind CSS for:
- **Accessibility**: WCAG compliant components
- **Customization**: Fully customizable design system
- **Performance**: Optimized for speed and SEO
- **Mobile First**: Responsive design principles

## 📊 Performance

### Optimizations
- **Bundle Splitting**: Automatic code splitting
- **Image Optimization**: WebP/AVIF support
- **Caching**: Aggressive caching strategies
- **Email Pooling**: Connection pooling for email services
- **Compression**: Gzip compression enabled

### Metrics
- **Lighthouse Score**: 95+ 
- **Core Web Vitals**: All green
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2s

## 🔒 Security

### Features
- **HTTPS**: Enforced in production
- **Security Headers**: Comprehensive security headers
- **Input Validation**: Zod schema validation
- **SQL Injection**: Protected via Supabase RLS
- **XSS Protection**: Content Security Policy
- **Authentication**: Secure JWT-based auth

## 📧 Email Templates

Professional HTML email templates for:
- **Welcome Emails**: User onboarding
- **Reward Notifications**: Points, credits, achievements
- **Contact Forms**: Business inquiries
- **Password Reset**: Account recovery

All templates are:
- Mobile responsive
- Cross-client compatible
- Branded with FastBookr design
- Performance optimized

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [Full Documentation](DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/fastbookr/issues)
- **Email**: hello@fastbookr.com
- **Phone**: +91 9098523694

## 🎉 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Vercel](https://vercel.com/) - Deployment platform

---

<div align="center">
  <strong>Built with ❤️ by the FastBookr Team</strong>
  <br>
  <a href="https://fastbookr.com">Website</a> •
  <a href="DEPLOYMENT.md">Deployment Guide</a> •
  <a href="#contributing">Contributing</a>
</div> 