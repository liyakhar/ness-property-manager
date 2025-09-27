/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    // Ignore ESLint errors during production builds to avoid build failures
    ignoreDuringBuilds: true,
  },
  // Optimize for hot module reload
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Ensure CSS is properly handled during HMR
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Ensure CSS modules work properly with HMR
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Optimize CSS handling for HMR
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            styles: {
              name: 'styles',
              test: /\.(css|scss)$/,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
}

export default nextConfig
