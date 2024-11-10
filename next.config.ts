/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  images: {
    domains: ['cdn.shade.cool', 'imagecdn.app', 'res.cloudinary.com'],
  },
};

export default nextConfig;
