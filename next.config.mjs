/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Add your remote patterns here
      { hostname: "book-my-singer.s3.ap-south-1.amazonaws.com" },
      { hostname: "gigsar.s3.ap-south-1.amazonaws.com" },
      { hostname: "bookmysinger.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },

  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  webpack: (config) => {
    config.resolve.fallback = {
      "mongodb-client-encryption": false,
      aws4: false,
    };

    return config;
  },
};

export default nextConfig;
