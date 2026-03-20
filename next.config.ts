import type { NextConfig } from "next";

const HF_BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://suryarao000-salesapi.hf.space';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/((?!auth/).*)',
        destination: `${HF_BACKEND}/api/$1`,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
};

export default nextConfig;
