import type { MetadataRoute } from "next";

const baseUrl = "https://shoutlyai.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboards/",
          "/admin/",
          "/content-admin/",
          "/technical-admin/",
          "/finance-admin/",
          "/account-setup",
          "/create-password",
          "/password-success",
          "/verification",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
