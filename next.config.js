/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [{ source: '/p', destination: '/partners/pharmacy' }];
  },
};
