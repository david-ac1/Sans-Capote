import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sans Capote",
    short_name: "Sans Capote",
    description:
      "Private, low-data HIV prevention and sexual health support for African contexts.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#22c55e",
    lang: "en",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
