/** @type {import('next').NextConfig} */
// Static export for GitHub Pages (or any static host).
// For a PROJECT page (https://<user>.github.io/<repo>/) set NEXT_PUBLIC_BASE_PATH=/<repo>
// at build time. For a USER/ORG page or custom domain, leave it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
