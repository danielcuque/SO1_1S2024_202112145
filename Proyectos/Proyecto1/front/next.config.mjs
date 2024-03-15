/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.PROXY_IP || 'http://192.168.1.23'}/api/:path*`,
            },
        ];
    }
};

export default nextConfig;
