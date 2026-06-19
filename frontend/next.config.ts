import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === "1";
const isStaticCapacitorExport = process.env.CAPACITOR_STATIC_EXPORT === "1";

const allowedOrigins = [
  "localhost:3000",
  "localhost:3001",
  "127.0.0.1:3000",
  "127.0.0.1:3001",
];

if (process.env.NEXT_OUTPUT_WSS_PROXY) {
  try {
    const domain = process.env.NEXT_OUTPUT_WSS_PROXY.replace(
      /^wss?:\/\//,
      "",
    ).split("/")[0];

    allowedOrigins.push(domain);
  } catch (e) {
    console.error("Erreur lors du parsing de NEXT_OUTPUT_WSS_PROXY", e);
  }
}

const nextConfig: NextConfig = {
  // Le projet iOS Capacitor utilise une URL distante configurée côté app.
  // On n'active l'export statique que si c'est explicitement demandé, car
  // plusieurs routes dynamiques du dashboard famille ne sont pas exportables.
  output: isCapacitorBuild && isStaticCapacitorExport ? "export" : undefined,

  turbopack: {
    root: process.cwd(),
  },

  images: isCapacitorBuild && isStaticCapacitorExport
    ? {
        unoptimized: true,
      }
    : undefined,

  allowedDevOrigins: allowedOrigins,

  experimental: {
    serverActions: {
      allowedOrigins: allowedOrigins.map((origin) => origin.split(":")[0]),
    },
  },
};

export default nextConfig;
