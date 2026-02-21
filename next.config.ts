import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // fallback: runs AFTER all Next.js file-system routes are checked.
      // /api/auth/* matches app/api/auth/[...nextauth]/route.ts → handled by Next.js.
      // /api/health, /api/forecast/* etc. have no matching file → proxied to Flask.
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/api/:path*",
        },
      ],
    };
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
};

export default nextConfig;
