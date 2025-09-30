import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/icons-svg'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rfmmeeyegjjqppjualuh.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      }
    ],
  },
  webpack: (config) => {
    // Fix for Ant Design's CSS-in-JS implementation
    return config;
  },
};

export default nextConfig;
