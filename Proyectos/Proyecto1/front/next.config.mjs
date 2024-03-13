/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://192.168.1.22:8080/api/:path*',
            },
        ];
    }
};

export default nextConfig;
