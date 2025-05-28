#!/bin/bash

# BookNow Platform - Vercel Deployment Script
# This script automates the deployment process to Vercel

echo "🚀 BookNow Platform - Vercel Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js and npm are installed"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Found package.json - in correct directory"

# Install dependencies
print_info "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_status "Dependencies installed successfully"

# Run build to check for errors
print_info "Building project to check for errors..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed. Please fix the errors before deploying."
    exit 1
fi
print_status "Build successful"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing globally..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        print_error "Failed to install Vercel CLI"
        exit 1
    fi
    print_status "Vercel CLI installed successfully"
else
    print_status "Vercel CLI is already installed"
fi

# Check if user is logged in to Vercel
print_info "Checking Vercel authentication..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    print_warning "Not logged in to Vercel. Please log in..."
    vercel login
    if [ $? -ne 0 ]; then
        print_error "Failed to log in to Vercel"
        exit 1
    fi
fi
print_status "Authenticated with Vercel"

# Check if .env.local exists and warn about environment variables
if [ -f ".env.local" ]; then
    print_warning "Found .env.local file. Make sure to set these environment variables in Vercel:"
    echo ""
    echo "Required environment variables for Vercel:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- DATABASE_URL"
    echo "- NEXT_PUBLIC_APP_URL"
    echo "- NEXTAUTH_SECRET"
    echo "- NEXTAUTH_URL"
    echo ""
    read -p "Have you set all environment variables in Vercel? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please set environment variables in Vercel dashboard first"
        print_info "Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
        exit 1
    fi
else
    print_warning "No .env.local file found. Make sure to set environment variables in Vercel dashboard."
fi

# Ask for deployment type
echo ""
print_info "Choose deployment type:"
echo "1. Production deployment (from main branch)"
echo "2. Preview deployment (current branch)"
read -p "Enter your choice (1 or 2): " -n 1 -r
echo

case $REPLY in
    1)
        print_info "Deploying to production..."
        vercel --prod
        ;;
    2)
        print_info "Creating preview deployment..."
        vercel
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    print_status "Deployment successful! 🎉"
    echo ""
    print_info "Next steps:"
    echo "1. Visit your deployment URL to test the application"
    echo "2. Update Supabase auth settings with your new domain"
    echo "3. Test all functionality (login, registration, business features)"
    echo "4. Monitor performance in Vercel dashboard"
    echo ""
    print_info "Supabase Configuration:"
    echo "- Go to Supabase Dashboard → Authentication → URL Configuration"
    echo "- Add your Vercel domain to Site URL and Redirect URLs"
    echo "- Update CORS settings in Settings → API"
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi 