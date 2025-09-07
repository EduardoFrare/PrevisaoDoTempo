
const { version } = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    APP_VERSION: version,
  },
};

export default nextConfig;