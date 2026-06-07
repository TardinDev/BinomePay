import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The repo root contains the mobile app's lockfile; pin the workspace root
  // to this web/ directory so Next.js stops inferring the parent as root.
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
