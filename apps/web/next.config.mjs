/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@nova/benchmark-engine',
    '@nova/opportunity-engine',
  ],
};

export default nextConfig;
