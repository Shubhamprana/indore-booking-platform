# 🚀 Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code is committed to Git
- [ ] Build runs successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All tests pass (if applicable)

### ✅ Environment Setup
- [ ] Supabase project is created and configured
- [ ] Database tables are created (run SQL migrations)
- [ ] Supabase RLS policies are enabled
- [ ] Environment variables are documented

### ✅ Vercel Account
- [ ] Vercel account is created
- [ ] Vercel CLI is installed (`npm i -g vercel`)
- [ ] Logged into Vercel (`vercel login`)

## Deployment Steps

### Method 1: Using Deployment Script (Recommended)
```bash
# For Windows
./deploy.bat

# For Mac/Linux
./deploy.sh
```

### Method 2: Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Post-Deployment Checklist

### ✅ Environment Variables in Vercel
Set these in Vercel Dashboard → Project → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
- [ ] `DATABASE_URL` = Your Supabase database URL
- [ ] `NEXT_PUBLIC_APP_URL` = Your Vercel app URL
- [ ] `NEXTAUTH_SECRET` = Random secret key
- [ ] `NEXTAUTH_URL` = Your Vercel app URL

### ✅ Supabase Configuration
Update in Supabase Dashboard → Authentication → URL Configuration:

- [ ] **Site URL**: `https://your-app-name.vercel.app`
- [ ] **Redirect URLs**: 
  - [ ] `https://your-app-name.vercel.app/auth/callback`
  - [ ] `https://your-app-name.vercel.app/login`
  - [ ] `https://your-app-name.vercel.app/register`

Update in Supabase Dashboard → Settings → API → CORS:
- [ ] Add your Vercel domain: `https://your-app-name.vercel.app`

### ✅ Functionality Testing
Test these features on your deployed app:

- [ ] **Homepage loads** without errors
- [ ] **User Registration** works
- [ ] **User Login** works
- [ ] **Profile page** displays correctly
- [ ] **Business search** works
- [ ] **Follow/Unfollow** functionality works
- [ ] **Business dashboard** (for business users)
- [ ] **Real-time updates** work
- [ ] **Referral system** works
- [ ] **Mobile responsiveness** works

### ✅ Performance & Security
- [ ] **Lighthouse score** > 90
- [ ] **Core Web Vitals** are green
- [ ] **HTTPS** is working (automatic with Vercel)
- [ ] **Security headers** are set (check vercel.json)
- [ ] **Error tracking** is working

### ✅ Monitoring Setup
- [ ] **Vercel Analytics** enabled
- [ ] **Error monitoring** configured
- [ ] **Uptime monitoring** set up (optional)

## Common Issues & Solutions

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variable Issues
- Ensure all variables are set in Vercel dashboard
- Variable names are case-sensitive
- Redeploy after adding variables

### Authentication Issues
- Check Supabase URL configuration
- Verify redirect URLs are correct
- Ensure CORS settings include your domain

### Real-time Features Not Working
- Verify Supabase real-time is enabled
- Check WebSocket connections in browser dev tools
- Ensure proper authentication

## Quick Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Deploy specific branch
vercel --prod --branch main

# Remove deployment
vercel rm project-name
```

## Success Indicators

✅ **Deployment URL** is accessible
✅ **All pages load** without errors
✅ **Authentication flow** works end-to-end
✅ **Database operations** work correctly
✅ **Real-time features** are functional
✅ **Performance scores** are good
✅ **Mobile experience** is smooth

## Next Steps After Successful Deployment

1. **Custom Domain** (optional)
   - Add custom domain in Vercel dashboard
   - Update DNS records
   - Update environment variables

2. **SEO Optimization**
   - Add meta tags
   - Set up sitemap
   - Configure robots.txt

3. **Analytics**
   - Set up Google Analytics
   - Configure conversion tracking
   - Monitor user behavior

4. **Marketing**
   - Share your app
   - Collect user feedback
   - Plan feature updates

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

**🎉 Congratulations! Your BookNow platform is now live on Vercel!** 