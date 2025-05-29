# BookNow Platform

> Skip the Wait, Book Instantly

A modern booking platform built with Next.js 15, Supabase, and TypeScript. BookNow allows users to discover businesses, follow their favorites, and stay updated with real-time notifications.

## 🚀 Features

- **User Authentication**: Secure login/register with Supabase Auth
- **Business Discovery**: Search and explore local businesses
- **Follow System**: Follow your favorite businesses for updates
- **Real-time Updates**: Live notifications and activity feeds
- **Responsive Design**: Modern UI with Tailwind CSS and Radix UI
- **Performance Optimized**: Built for speed and scalability

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + Radix UI
- **Language**: TypeScript
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd booknow-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials and other configuration variables.

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Environment Variables

Required environment variables for deployment:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=BookNow
NEXT_PUBLIC_APP_DESCRIPTION=Skip the Wait, Book Instantly

# Security
NEXTAUTH_SECRET=your_secure_secret_key
NEXTAUTH_URL=https://your-domain.com
```

## 🚀 Deployment

### Deploy to Vercel

1. **Using Vercel CLI**:
```bash
npm i -g vercel
vercel login
vercel
```

2. **Using GitHub Integration**:
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Configure environment variables
   - Deploy automatically

### Build Locally

```bash
npm run build
npm start
```

## 📁 Project Structure

```
booknow-platform/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── business/          # Business-related pages
│   ├── profile/           # User profile pages
│   └── ...
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── public/                # Static assets
├── styles/                # Global styles
└── ...
```

## 🔨 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript checks
- `npm run clean` - Clean build directories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.

---

**Built with ❤️ using Next.js and Supabase** 