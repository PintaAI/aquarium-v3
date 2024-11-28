import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'cdn.shade.cool',
      },
      {
        protocol: 'https' as const,
        hostname: 'imagecdn.app',
      },
      {
        protocol: 'https' as const,
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '3mb',
      allowedOrigins: ['localhost:3000']
    },
    turbo: {
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      moduleIdStrategy: (process.env.NODE_ENV === 'development' ? 'named' : 'deterministic') as 'named' | 'deterministic',
    },
  },
};

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);

export default config;
