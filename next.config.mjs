/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Không sử dụng các module Node.js trong môi trường trình duyệt
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        http2: false,
      };
    }
    return config;
  },
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.builder.io",
      },
    ],
  },
  // Optimize production build
  swcMinify: true,
  // Add trailing slash
  trailingSlash: false,
  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Handle environment variables
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;