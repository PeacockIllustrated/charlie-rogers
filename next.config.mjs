/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // The contact form sends up to three photographs, shrunk in the browser
    // to about a megabyte each. Vercel caps a request at 4.5 MB.
    serverActions: { bodySizeLimit: '4mb' },
  },
};

export default nextConfig;
