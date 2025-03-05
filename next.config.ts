import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          }
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'content-type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          }
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'content-type',
            value: 'application/manifest+json; charset=utf-8',
          }
        ],
      }
    ]
  },
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  }
}

export default nextConfig
