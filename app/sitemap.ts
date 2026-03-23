import type { MetadataRoute } from "next";

const baseUrl = "https://shoutlyai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/for",
    "/for/restaurants",
    "/for/fitness-studios",
    "/for/real-estate",
    "/about-us",
    "/affiliate-program",
    "/careers",
    "/case-studies",
    "/contact-us",
    "/cookie",
    "/free-editorial",
    "/help-center",
    "/join-community",
    "/policy",
    "/press-media",
    "/pricing",
    "/sign-in",
    "/sign-up",
    "/terms",
  ];

  const lastModified = new Date();

  return routes.map((route, index) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
