import type { NextConfig } from "next";
import path from "path";

const backendOrigin =
  process.env.API_URL?.replace(/\/api\/?$/, "") ||
  process.env.BACKEND_URL ||
  "http://localhost:5000";

const nextConfig: NextConfig = {
  // Avoid picking up a lockfile outside this app (e.g. C:\Users\trish\package-lock.json)
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    // Same-origin proxy so auth cookies are set on the frontend host (localhost:3000)
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nirmalspices.in',
        port: '',
        pathname: '/admin/images/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
