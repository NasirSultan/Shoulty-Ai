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
    "/pricing",
    "/help-center",
    "/case-studies",
    "/contact-us",
    "/press-media",
    "/careers",
    "/sign-in",
    "/sign-up",
    "/join-community",
    "/free-editorial",
    "/affiliate-program",
    "/policy",
    "/terms",
    "/cookie",
  ];

  const lastModified = new Date();

  return routes.map((route, index) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
