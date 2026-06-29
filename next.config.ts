import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude optional packages from bundling — loaded at runtime only when installed
  serverExternalPackages: ["resend", "stripe", "@google/generative-ai", "socket.io-client"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
