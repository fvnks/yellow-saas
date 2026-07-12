/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@yellow-erp/ui', '@yellow-erp/db', '@yellow-erp/auth', '@yellow-erp/api'],
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
};

module.exports = nextConfig;