import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingIncludes: {
    "/api/chat": ["src/resume_demo/*.py"],
  },
};

export default nextConfig;
