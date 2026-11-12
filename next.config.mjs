const securityHeaders = [
  // Stops other sites from loading these pages in a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
