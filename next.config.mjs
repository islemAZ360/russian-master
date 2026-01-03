/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'grainy-gradients.vercel.app' },
      { protocol: 'https', hostname: 'assets.aceternity.com' }
    ],
  },
};

export default nextConfig;