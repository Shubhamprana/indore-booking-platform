# 🔧 Network Troubleshooting for Vercel Deployment

## Issue Identified
You're experiencing network connectivity issues that are preventing Vercel CLI from working properly:
- `ENOTFOUND api.vercel.com`
- `ENOTFOUND registry.npmjs.org`

## Quick Solutions

### 1. Check Internet Connection
```bash
# Test basic connectivity
ping google.com
ping vercel.com
ping registry.npmjs.org
```

### 2. Firewall/Antivirus Issues
- **Temporarily disable** Windows Firewall
- **Temporarily disable** antivirus software
- **Add exceptions** for Node.js and npm in your security software

### 3. Network Configuration
```bash
# Clear DNS cache
ipconfig /flushdns

# Reset network settings
netsh winsock reset
netsh int ip reset

# Restart your computer after running these commands
```

### 4. Proxy/Corporate Network
If you're on a corporate network:
```bash
# Configure npm proxy (replace with your proxy details)
npm config set proxy http://your-proxy-server:port
npm config set https-proxy http://your-proxy-server:port

# Or remove proxy settings
npm config delete proxy
npm config delete https-proxy
```

### 5. Use Different DNS
Change your DNS to Google's or Cloudflare's:
- **Google DNS**: 8.8.8.8, 8.8.4.4
- **Cloudflare DNS**: 1.1.1.1, 1.0.0.1

## Alternative Deployment Methods

### Method 1: GitHub Integration (Recommended)

Since CLI isn't working, use GitHub integration:

1. **Push to GitHub** (if not already done):
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **Deploy via Vercel Website**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings and deploy

### Method 2: VS Code Extension

1. **Install Vercel Extension** in VS Code
2. **Login** through the extension
3. **Deploy** directly from VS Code

### Method 3: Use Different Network

- **Mobile Hotspot**: Try using your phone's hotspot
- **Different WiFi**: Connect to a different network
- **VPN**: Use a VPN service to bypass network restrictions

## GitHub Integration Step-by-Step

### Step 1: Prepare Repository
```bash
# Make sure all files are committed
git status
git add .
git commit -m "Prepare for Vercel deployment via GitHub"
git push origin main
```

### Step 2: Vercel Dashboard Setup
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Choose "Import Git Repository"
4. Select your repository
5. Configure project settings:
   - **Project Name**: `booknow-platform`
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Environment Variables
Add these in Project Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-app.vercel.app
```

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

## Immediate Actions

### 1. Try Mobile Hotspot
```bash
# Connect to mobile hotspot, then try:
vercel login
```

### 2. Use GitHub Method
Since CLI is problematic, proceed with GitHub integration:

1. **Commit and Push**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

3. **Import Repository**: Click "New Project" → Import Git Repository

## Testing Network Issues

### Check DNS Resolution
```bash
nslookup api.vercel.com
nslookup registry.npmjs.org
```

### Test with Different Commands
```bash
# Try npm registry directly
npm config get registry

# Try changing npm registry
npm config set registry https://registry.npmjs.org/

# Test with yarn instead
yarn --version
```

## Corporate Network Solutions

If you're on a corporate network:

### 1. Contact IT Department
Ask about:
- Firewall rules for npm and Vercel
- Proxy settings
- Whitelist requirements

### 2. Use Internal Tools
Some companies have internal deployment tools or approved methods.

### 3. Work from Personal Network
Deploy from home or personal network if possible.

## Success Indicators

Once network issues are resolved, you should see:
- ✅ `vercel whoami` returns your email
- ✅ `npm install` works without errors
- ✅ `vercel --prod` initiates deployment

## Alternative: Local Development

While troubleshooting network issues:
```bash
# Continue local development
npm run dev
```

Your app will be available at `http://localhost:3000` for testing.

## Next Steps

1. **Try Mobile Hotspot** first (quickest solution)
2. **Use GitHub Integration** if CLI continues to fail
3. **Contact Network Administrator** if on corporate network
4. **Try from Different Location** if all else fails

Once deployed successfully, you'll get a URL like:
`https://your-app-name.vercel.app`

## Support

If issues persist:
- **Vercel Support**: [vercel.com/help](https://vercel.com/help)
- **Network Administrator**: For corporate network issues
- **ISP Support**: For home network issues 