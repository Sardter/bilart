/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Set the CORS headers for images from localhost:8000
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:8000',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: false,
}

module.exports = nextConfig
