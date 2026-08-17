import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Sanity CDN is added in Phase 3. Editorial ratios only; no white-sweep stock.
    formats: ['image/avif', 'image/webp'],
  },
  // Import the file-based content (content/client/*.md) as raw strings so it is
  // bundled into the server code. Cloudflare Workers has no filesystem, so the
  // content loaders can't readFileSync at runtime — they read these imports.
  webpack: (config) => {
    config.module.rules.push({ test: /\.md$/, type: 'asset/source' })
    return config
  },
}

export default nextConfig
