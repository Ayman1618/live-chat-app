/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for Vercel deployment
  swcMinify: true,
  // Enable static optimization where possible
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
