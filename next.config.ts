import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'geatcbzgqsovildlkagm.supabase.co', // ของ Supabase (อันเดิม)
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com', // ++ เพิ่มอันนี้สำหรับ Google ++
      port: '',
      pathname: '/**',
    }
  ]
},
};

export default nextConfig;
