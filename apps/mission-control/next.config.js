/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir imagens de dominios externos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Variaveis de ambiente publicas (use .env.local ou Vercel)
  env: {
    NEXT_PUBLIC_MAESTRO_URL: process.env.NEXT_PUBLIC_MAESTRO_URL || 'http://localhost:8080',
  },
}

module.exports = nextConfig
