/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'], // Add any image domains you'll use
  },
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    if (!isServer) {
      // Client-side specific configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        child_process: false,
      };

      // Prevent server-only modules from being included in the client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        bcrypt: false,
        '@mapbox/node-pre-gyp': false,
      };
    }

    return config;
  },
};

module.exports = nextConfig; 