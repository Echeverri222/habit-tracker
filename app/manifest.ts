import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Habit Tower",
    short_name: "Habits",
    description: "A pixel-art habit tracker. One floor per habit.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070b24",
    theme_color: "#070b24",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
