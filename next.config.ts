import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "larosavino.com" },
      { protocol: "https", hostname: "www.larosavino.com" },
    ],
  },
};

export default nextConfig;
