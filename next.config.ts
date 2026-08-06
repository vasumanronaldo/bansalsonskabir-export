import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Sanity CDN is added in Phase 3. Editorial ratios only; no white-sweep stock.
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
