/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.PROXY_IP}/api/:path*`,
            },
        ];
    }
};

export default nextConfig;
