/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')(['folks-finance-js-sdk']);
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withTM(nextConfig);
