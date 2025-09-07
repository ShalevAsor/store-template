import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dhzo6p19lg68n.cloudfront.net", // your CF domain
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
