import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Dangerous: This bypasses type checking during production builds entirely
    ignoreBuildErrors: true,
  },
  cacheComponents: true,
  experimental: {
    // Avoid Turbopack server HMR resubscribe loop (EcmascriptMergedChunkVersion).
    turbopackServerFastRefresh: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ufs.sh',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
    ],
  },
};

export default nextConfig;
