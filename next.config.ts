import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * sharp ships prebuilt .node binaries. Bundling those into the route is at
   * best pointless and at worst hangs the compile, so it is loaded from
   * node_modules at runtime instead.
   */
  serverExternalPackages: ['sharp'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oacuekchmzilyimjasdh.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/maps/api/staticmap**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/Home',
      },
    ];
  },
};

export default nextConfig;
