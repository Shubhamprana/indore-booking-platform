# Vercel Deployment Guide for BookNow Platform

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Supabase Project**: Ensure your Supabase project is set up and running

## Step 1: Prepare Your Repository

### 1.1 Ensure Clean Build
```bash
npm run build
```
✅ **Status**: Your project builds successfully!

### 1.2 Create Vercel Configuration
Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Step 2: Environment Variables Setup

### 2.1 Required Environment Variables
Set these in your Vercel project dashboard:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
DATABASE_URL=your_supabase_database_url

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_NAME=BookNow
NEXT_PUBLIC_APP_DESCRIPTION=Skip the Wait, Book Instantly

# Security
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-app-name.vercel.app

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### 2.2 How to Get Supabase Values
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Follow the prompts**:
   - Link to existing project? **N**
   - What's your project's name? **booknow-platform**
   - In which directory is your code located? **.**
   - Want to override the settings? **N**

### Method 2: GitHub Integration

1. **Push to GitHub**:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"New Project"**
   - Import your GitHub repository
   - Configure settings (see below)

## Step 4: Configure Vercel Project Settings

### 4.1 Build & Development Settings
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

### 4.2 Environment Variables
Add all the environment variables from Step 2.1 in:
**Project Settings** → **Environment Variables**

### 4.3 Domain Configuration
1. **Custom Domain** (optional):
   - Go to **Project Settings** → **Domains**
   - Add your custom domain
   - Update DNS records as instructed

## Step 5: Supabase Configuration for Production

### 5.1 Update Supabase Auth Settings
1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel domain to:
   - **Site URL**: `https://your-app-name.vercel.app`
   - **Redirect URLs**: 
     - `https://your-app-name.vercel.app/auth/callback`
     - `https://your-app-name.vercel.app/login`
     - `https://your-app-name.vercel.app/register`

### 5.2 Update CORS Settings
1. Go to **Settings** → **API**
2. Add your Vercel domain to **CORS origins**:
   - `https://your-app-name.vercel.app`

## Step 6: Database Migration (if needed)

If you have pending database migrations:

```bash
# Run migrations on production database
npx supabase db push --db-url "your_production_database_url"
```

## Step 7: Post-Deployment Verification

### 7.1 Check Deployment Status
- Visit your Vercel dashboard
- Ensure deployment completed successfully
- Check build logs for any errors

### 7.2 Test Core Functionality
1. **Authentication**: Login/Register
2. **Profile Management**: View/Edit profile
3. **Business Search**: Search and follow businesses
4. **Dashboard**: Business dashboard (if business user)
5. **Real-time Updates**: Follow/unfollow actions

### 7.3 Performance Optimization
1. **Enable Analytics** in Vercel dashboard
2. **Monitor Core Web Vitals**
3. **Check Lighthouse scores**

## Step 8: Custom Domain Setup (Optional)

### 8.1 Add Custom Domain
1. Go to **Project Settings** → **Domains**
2. Add your domain (e.g., `booknow.com`)
3. Configure DNS records:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

### 8.2 Update Environment Variables
Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to your custom domain.

## Step 9: Monitoring and Maintenance

### 9.1 Set Up Monitoring
1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Consider Sentry integration
3. **Uptime Monitoring**: Use services like UptimeRobot

### 9.2 Automatic Deployments
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from feature branches
- **Development**: Use `vercel dev` for local development

## Troubleshooting Common Issues

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variable Issues
- Ensure all required variables are set
- Check variable names (case-sensitive)
- Restart deployment after adding variables

### Supabase Connection Issues
- Verify Supabase URL and keys
- Check CORS settings
- Ensure database is accessible

### Real-time Features Not Working
- Verify Supabase real-time is enabled
- Check WebSocket connections in browser dev tools
- Ensure proper authentication

## Performance Optimization Tips

### 1. Image Optimization
```javascript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/your-image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // for above-the-fold images
/>
```

### 2. Code Splitting
```javascript
// Dynamic imports for heavy components
const BusinessDashboard = dynamic(() => import('./BusinessDashboard'), {
  loading: () => <div>Loading...</div>
})
```

### 3. Caching Strategy
- Static assets: Cached automatically by Vercel
- API responses: Implement proper cache headers
- Database queries: Use Supabase caching

## Security Checklist

- ✅ Environment variables properly configured
- ✅ Supabase RLS policies enabled
- ✅ CORS settings configured
- ✅ HTTPS enforced (automatic with Vercel)
- ✅ Authentication properly implemented
- ✅ API routes protected

## Deployment Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm project-name
```

## Success Metrics

After successful deployment, you should see:

1. **Build Status**: ✅ Successful
2. **Performance Score**: 90+ on Lighthouse
3. **Core Web Vitals**: All green
4. **Functionality**: All features working
5. **Real-time Updates**: Working properly
6. **Authentication**: Login/logout working
7. **Database**: All CRUD operations working

## Support and Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

## Quick Deployment Checklist

- [ ] Code builds successfully locally
- [ ] GitHub repository is up to date
- [ ] Supabase project is configured
- [ ] Environment variables are prepared
- [ ] Vercel account is set up
- [ ] Domain is ready (if using custom domain)
- [ ] Deploy using Vercel CLI or GitHub integration
- [ ] Configure environment variables in Vercel
- [ ] Update Supabase auth settings
- [ ] Test all functionality
- [ ] Monitor performance and errors

Your BookNow platform is now ready for production! 🚀 