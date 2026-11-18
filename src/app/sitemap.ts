import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

const ROUTES = ["", "/about", "/cybersecurity", "/projects", "/showcase", "/gallery", "/services", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r}`,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.7,
  }));
}
