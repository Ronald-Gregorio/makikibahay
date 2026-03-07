/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@makikibahay/types', '@makikibahay/ui', '@makikibahay/utils'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    serverComponentsExternalPackages: ['@makikibahay/ui']
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;