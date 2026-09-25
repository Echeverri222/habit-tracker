import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let phones on the local network load dev JS (dev only; ignored in production).
  allowedDevOrigins: ["192.168.78.219"],
};

export default nextConfig;
