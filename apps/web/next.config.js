/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin')('./src/i18n/request.ts');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  transpilePackages: ['@yellow-erp/ui', '@yellow-erp/db', '@yellow-erp/auth', '@yellow-erp/api'],
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/offline.html',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ];
  },
};

module.exports = createNextIntlPlugin(nextConfig);