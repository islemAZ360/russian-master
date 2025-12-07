import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true }, // مهم جداً للتطبيقات
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);