import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: './src/lib/empty-module.js',
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  serverExternalPackages: ['pdf-lib', 'bcryptjs', 'pdfjs-dist'],
};

export default nextConfig;
