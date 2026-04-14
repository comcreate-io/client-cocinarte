/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  async redirects() {
    return [
      // Force non-www → www (301 permanent)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'cocinartepdx.com' }],
        destination: 'https://www.cocinartepdx.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
