import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA configuration applied conditionally in production
};

// Conditionally apply PWA plugin only in production
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: false,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      {
        urlPattern: /^https:\/\/api\.openrouter\.ai\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "openrouter-api",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      {
        urlPattern: /\/api\/images\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "wardrobe-images",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
        },
      },
      {
        urlPattern: /\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
    ],
  });
  
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}
