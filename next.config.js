/** @type {import('next').NextConfig} */

// High-Performance Next.js Configuration for 1000+ Concurrent Users
const nextConfig = {
  // Enable React 18 features and concurrent rendering
  reactStrictMode: true,
  
  // Performance optimizations
  compiler: {
    // Remove console.log in production for better performance
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // External packages that should be bundled
  serverExternalPackages: ['@supabase/supabase-js'],

  // Image optimization for better performance
  images: {
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    
    // Optimize images from external domains
    domains: [
      'localhost',
      'supabase.co',
      'storage.googleapis.com',
      'images.unsplash.com',
      'avatars.githubusercontent.com',
    ],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
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
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 20,
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

  // Headers for security and performance
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
          
          // Performance headers
          {
            key: 'X-Served-By',
            value: 'Next.js'
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
        // Cache API responses with shorter TTL
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60'
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
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    },
    
    // Disable source maps for better performance
    productionBrowserSourceMaps: false,
  }),
}

// Bundle analyzer for optimization insights
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  })
  module.exports = withBundleAnalyzer(nextConfig)
} else {
  module.exports = nextConfig
} 