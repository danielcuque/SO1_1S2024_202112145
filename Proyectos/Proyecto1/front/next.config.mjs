/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        const proxy = process.env.PROXY_IP || 'http://192.168.1.23';
        return [
            {
                source: '/api/:path*',
                destination: `${proxy}:8080/api/:path*`,
            },
        ];
    }
};

export default nextConfig;
