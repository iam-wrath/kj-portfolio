import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jeffrey Agyemang Acheampong — Cybersecurity & Digital Media",
    short_name: "Jeffrey A.",
    description: "Portfolio of Jeffrey Agyemang Acheampong: aspiring cybersecurity analyst and digital media creator in Kumasi, Ghana.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
