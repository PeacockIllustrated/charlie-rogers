/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The schools proposal for Brian is a self-contained static page in
  // public/step-inside (it runs its own three.js scenes), served at /step-inside.
  async rewrites() {
    return [{ source: '/step-inside', destination: '/step-inside/index.html' }]
  },
  async headers() {
    return [{ source: '/step-inside/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
};

export default nextConfig;
