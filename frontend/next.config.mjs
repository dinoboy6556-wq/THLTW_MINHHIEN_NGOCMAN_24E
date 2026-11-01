/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiUrl = new URL(
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
    );
    const apiBasePath = apiUrl.pathname.replace(/\/+$/, "");
    const backendOrigin = apiUrl.origin;

    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendOrigin}${apiBasePath}/:path*`,
      },
      {
        source: "/backend-storage/:path*",
        destination: `${backendOrigin}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
