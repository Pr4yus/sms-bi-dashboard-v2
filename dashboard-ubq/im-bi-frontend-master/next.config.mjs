/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica para APIs externas
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:4001'
  },
  
  // Configuración para desarrollo y producción
  experimental: {
    serverComponentsExternalPackages: [],
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@refinedev/mui'],
  },

  // Optimizaciones de webpack
  webpack: (config, { dev, isServer }) => {
    // Optimizar chunks
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          mui: {
            name: 'mui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            priority: 30,
            enforce: true,
          },
          refine: {
            name: 'refine',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@refinedev[\\/]/,
            priority: 20,
            enforce: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 10,
          },
        },
      };
    }
    return config;
  },
  
  // Configuración para producción
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:4001'}/:path*`
      }
    ];
  },
  
  // Configuración de headers CORS para desarrollo
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ];
  },

  // Optimizaciones adicionales
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
