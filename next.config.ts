import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Digital Asset Links der Play-App (TWA). Next liefert Dateien aus einem
  // Punkt-Ordner in "public" nicht zuverlässig aus, deshalb per Rewrite.
  async rewrites() {
    return [
      {
        source: "/.well-known/assetlinks.json",
        destination: "/assetlinks.json",
      },
    ];
  },
};

export default nextConfig;
