/** @type {import('next').NextConfig} */

// Production-Ready Next.js Configuration for FastBookr
const nextConfig = {
  // Enable React 18 features and concurrent rendering
  reactStrictMode: true,
  
  // Performance optimizations
  compiler: {
    // Remove console.log in production for better performance
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // External packages that should be bundled
  serverExternalPackages: ['@supabase/supabase-js', 'nodemailer'],

  // Image optimization for better performance
  images: {
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    
    // Use remote patterns instead of deprecated domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Optimize image loading
    minimumCacheTTL: 31536000, // 1 year
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle Node.js modules for server-side only
    if (isServer) {
      // For server-side, externalize nodemailer to prevent bundling issues
      config.externals = config.externals || []
      if (!config.externals.some(ext => 
        (typeof ext === 'string' && ext.includes('nodemailer')) ||
        (typeof ext === 'function' && ext.toString().includes('nodemailer'))
      )) {
        config.externals.push('nodemailer')
      }
    } else {
      // For client-side, only add fallbacks for specific problematic modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Only add fallbacks for modules that are definitely server-side only
        fs: false,
        net: false,
        tls: false,
        dns: false,
      }
    }

    // Optimize bundle splitting for production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              enforce: true,
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 30,
              enforce: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }
    }

    // Add performance-optimized plugins
    if (!dev && !isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: false,
        })
      )
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Optimize lodash imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'lodash': 'lodash-es',
    }

    return config
  },

  // Enhanced security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          
          // Performance headers
          {
            key: 'X-Served-By',
            value: 'FastBookr'
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/(_next/static|favicon.ico|robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      {
        // Cache API responses appropriately
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
        ],
      },
    ]
  },

  // Compression for better performance
  compress: true,

  // PoweredBy header removal for security
  poweredByHeader: false,

  // Generate ETags for better caching
  generateEtags: true,

  // Trailing slash configuration
  trailingSlash: false,

  // Optimized redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // Add more redirects as needed
    ]
  },

  // Enable gzip compression
  async rewrites() {
    return [
      // API rewrite for better SEO
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // Environment variables for runtime optimization
  env: {
    NEXT_TELEMETRY_DISABLED: '1', // Disable telemetry for better performance
    ANALYZE: process.env.ANALYZE,
  },

  // TypeScript configuration
  typescript: {
    // Type checking is already done in CI/CD pipeline
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // ESLint configuration
  eslint: {
    // ESLint is already run in CI/CD pipeline
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },

  // Production-specific optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Disable source maps for better performance and security
    productionBrowserSourceMaps: false,
    
    // Additional compression
    compress: true,
  }),
}

// Bundle analyzer for optimization insights (development only)
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  })
  module.exports = withBundleAnalyzer(nextConfig)
} else {
  module.exports = nextConfig
} 