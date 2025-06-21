import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for Netlify
  images: {
    unoptimized: true,
  },
  
  // Enable static exports if needed
  // output: 'export',
  // trailingSlash: true,
  
  // Environment variables that should be available on the client
  env: {
    // Add any custom environment variables here
    // NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
