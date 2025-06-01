# BookNow - Multi-Service Booking Platform

Skip the wait, book instantly. One app for restaurants, salons, clinics, hotels & more.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- React DevTools for better debugging experience

### React DevTools Installation

Install the React DevTools extension for better development experience:

- **Chrome**: [React DevTools Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- **Firefox**: [React DevTools Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- **Edge**: [React DevTools Edge Extension](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   
   **🚨 SECURITY NOTICE: Never commit secrets to git!**
   
   Create `.env.local` in your project root:
   ```bash
   # Supabase Configuration
   # Get these from https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   
   # Development Environment
   NODE_ENV=development
   ```
   
   **How to get your Supabase credentials:**
   1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
   2. Select your project
   3. Navigate to Settings → API
   4. Copy the Project URL and anon/public key
   5. **Never share or commit these values!**

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Common Development Issues

#### Favicon 404 Error
The favicon is now properly configured using SVG format. If you still see 404 errors, clear your browser cache.

#### CSS Import Errors
CSS is properly structured with Tailwind layers. If you see @import related errors, ensure you're using the latest version of the application.

#### Authentication Timeout
Authentication has a 3-second timeout for better UX. Console warnings in development mode are normal and help with debugging.

### Production Build

```bash
npm run build
npm start
```

## Features

- Multi-service booking platform
- User authentication with Supabase
- Real-time updates
- Responsive design
- Business discovery
- Referral system
- Admin dashboard

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Radix UI Components 