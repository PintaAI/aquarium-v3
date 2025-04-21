import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pejuangkorea',
    short_name: 'Pejuangkorea',
    description: 'Korean Language Learning Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff', // Light mode background
    theme_color: '#095443', // Primary brand color
    orientation: 'portrait',
    icons: [
      {
        src: '/images/circle-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/circle-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/images/circle-logo.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
  }
}
