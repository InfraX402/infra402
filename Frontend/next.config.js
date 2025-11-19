/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    X402_BACKEND_URL: process.env.X402_BACKEND_URL || 'http://localhost:4021/premium/content'
  }
};

module.exports = nextConfig;
