import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tesseract.js resolves its worker-thread scripts relative to __dirname at
  // runtime — bundling it (the default for Route Handlers) rewrites those
  // paths to a placeholder that doesn't exist ("Cannot find module
  // 'C:\ROOT\node_modules\tesseract.js\...'"). Opting it out of bundling
  // keeps it a native Node `require`, same as apps/api's plain tsx process
  // where it already works.
  serverExternalPackages: ["tesseract.js"],
};

export default nextConfig;
