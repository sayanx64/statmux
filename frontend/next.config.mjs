const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend in local and prod
      },
    ]
  },
}

export default nextConfig
