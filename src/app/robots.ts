import { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  const secretPath =
    process.env.ADMIN_SECRET_PATH ||
    process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH ||
    "/portal-x9k-manage";
  const cleanSecret = secretPath.endsWith("/") ? secretPath : `${secretPath}/`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", cleanSecret, "/api/"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}

