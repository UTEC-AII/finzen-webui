/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Genera un servidor mínimo autónomo para la imagen Docker de producción.
  output: "standalone",
};

export default nextConfig;
