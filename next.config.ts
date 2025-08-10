import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Desactiva ESLint durante el build de producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Opcionalmente, también puedes ignorar errores de TypeScript
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;
