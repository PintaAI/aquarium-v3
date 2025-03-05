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
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      }
    ],
  }
}
