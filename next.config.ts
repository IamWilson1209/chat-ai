/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      /* add .convex.cloud */
      { hostname: "dev:basic-ibis-688.convex.cloud" },
      { hostname: "oaidalleapiprodscus.blob.core.windows.net" },
    ],
  },
};

export default nextConfig;