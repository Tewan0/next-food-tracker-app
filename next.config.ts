import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'geatcbzgqsovildlkagm.supabase.co', // ของ Supabase
        port: '',
        pathname: '/**',
      }
    ]
  },
};

export default nextConfig;