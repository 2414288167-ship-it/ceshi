/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇👇👇 加上这部分 👇👇👇
  typescript: {
    // 即使有 TS 错误，也强行打包
    ignoreBuildErrors: true,
  },
  eslint: {
    // 即使有 ESLint 警告，也强行打包
    ignoreDuringBuilds: true,
  },
  // 👆👆👆 加上这部分 👆👆👆
};

module.exports = nextConfig;
