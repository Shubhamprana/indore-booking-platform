@echo off
setlocal enabledelayedexpansion

:: BookNow Platform - Vercel Deployment Script (Windows)
:: This script automates the deployment process to Vercel

echo.
echo 🚀 BookNow Platform - Vercel Deployment Script
echo ==============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

echo ✅ Found package.json - in correct directory

:: Install dependencies
echo.
echo ℹ️  Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

:: Run build to check for errors
echo.
echo ℹ️  Building project to check for errors...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed. Please fix the errors before deploying.
    pause
    exit /b 1
)
echo ✅ Build successful

:: Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Vercel CLI not found. Installing globally...
    call npm install -g vercel
    if errorlevel 1 (
        echo ❌ Failed to install Vercel CLI
        pause
        exit /b 1
    )
    echo ✅ Vercel CLI installed successfully
) else (
    echo ✅ Vercel CLI is already installed
)

:: Check if user is logged in to Vercel
echo.
echo ℹ️  Checking Vercel authentication...
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Not logged in to Vercel. Please log in...
    call vercel login
    if errorlevel 1 (
        echo ❌ Failed to log in to Vercel
        pause
        exit /b 1
    )
)
echo ✅ Authenticated with Vercel

:: Check if .env.local exists and warn about environment variables
if exist ".env.local" (
    echo.
    echo ⚠️  Found .env.local file. Make sure to set these environment variables in Vercel:
    echo.
    echo Required environment variables for Vercel:
    echo - NEXT_PUBLIC_SUPABASE_URL
    echo - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo - SUPABASE_SERVICE_ROLE_KEY
    echo - DATABASE_URL
    echo - NEXT_PUBLIC_APP_URL
    echo - NEXTAUTH_SECRET
    echo - NEXTAUTH_URL
    echo.
    set /p "envConfirm=Have you set all environment variables in Vercel? (y/n): "
    if /i not "!envConfirm!"=="y" (
        echo ❌ Please set environment variables in Vercel dashboard first
        echo ℹ️  Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
        pause
        exit /b 1
    )
) else (
    echo ⚠️  No .env.local file found. Make sure to set environment variables in Vercel dashboard.
)

:: Ask for deployment type
echo.
echo ℹ️  Choose deployment type:
echo 1. Production deployment (from main branch)
echo 2. Preview deployment (current branch)
set /p "deployChoice=Enter your choice (1 or 2): "

if "!deployChoice!"=="1" (
    echo ℹ️  Deploying to production...
    call vercel --prod
) else if "!deployChoice!"=="2" (
    echo ℹ️  Creating preview deployment...
    call vercel
) else (
    echo ❌ Invalid choice. Exiting.
    pause
    exit /b 1
)

if errorlevel 1 (
    echo ❌ Deployment failed. Please check the error messages above.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Deployment successful! 🎉
    echo.
    echo ℹ️  Next steps:
    echo 1. Visit your deployment URL to test the application
    echo 2. Update Supabase auth settings with your new domain
    echo 3. Test all functionality (login, registration, business features)
    echo 4. Monitor performance in Vercel dashboard
    echo.
    echo ℹ️  Supabase Configuration:
    echo - Go to Supabase Dashboard → Authentication → URL Configuration
    echo - Add your Vercel domain to Site URL and Redirect URLs
    echo - Update CORS settings in Settings → API
    echo.
)

pause 