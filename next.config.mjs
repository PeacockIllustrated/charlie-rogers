/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Retitled "October morning: Cotfield Street, Gateshead" on Brian
      // Rankin's word, 12 October 2026. The old address was live for a day.
      {
        source: '/catalogue/back-cotfield-street-gateshead',
        destination: '/catalogue/october-morning-cotfield-street-gateshead',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
