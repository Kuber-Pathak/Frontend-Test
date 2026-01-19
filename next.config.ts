import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Rewrites to avoid CORS and cookie issues (Proxy API requests)
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${backendUrl}/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
