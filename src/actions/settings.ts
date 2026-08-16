"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
  try {
    let settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: {
          id: "default",
          siteName: "Tourism Seasons",
          siteNameKhmer: "រដូវកាលទេសចរណ៍",
          siteSubtitle: "Travel & Seasonal Guides",
          siteSubtitleKhmer: "មគ្គុទ្ទេសក៍ទេសចរណ៍",
          logoUrl: "/logo.png",
          logoKhmerUrl: "/logo-khmer.png",
          description:
            "Discover top travel destinations, seasonal vacation recommendations, local culture, and tourism insights across the world.",
          descriptionKhmer:
            "ស្វែងរកតំបន់ទេសចរណ៍កំពូលៗ អត្ថបទ និងការណែនាំអំពីការធ្វើដំណើរកម្សាន្តនៅគ្រប់រដូវកាល។",
        },
      });
    }

    return { success: true, settings };
  } catch (error: any) {
    console.error("Error fetching site settings:", error);
    return {
      success: false,
      settings: {
        id: "default",
        siteName: "Tourism Seasons",
        siteNameKhmer: "រដូវកាលទេសចរណ៍",
        siteSubtitle: "Travel & Seasonal Guides",
        siteSubtitleKhmer: "មគ្គុទ្ទេសក៍ទេសចរណ៍",
        logoUrl: "/logo.png",
        logoKhmerUrl: "/logo-khmer.png",
        description:
          "Discover top travel destinations, seasonal vacation recommendations, local culture, and tourism insights across the world.",
        descriptionKhmer:
          "ស្វែងរកតំបន់ទេសចរណ៍កំពូលៗ អត្ថបទ និងការណែនាំអំពីការធ្វើដំណើរកម្សាន្តនៅគ្រប់រដូវកាល។",
      },
    };
  }
}

export async function updateSiteSettings(data: {
  siteName: string;
  siteNameKhmer?: string;
  siteSubtitle?: string;
  siteSubtitleKhmer?: string;
  logoUrl?: string;
  logoKhmerUrl?: string;
  description?: string;
  descriptionKhmer?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (!session || (userRole !== "SUPERADMIN" && userRole !== "ADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const settings = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {
        siteName: data.siteName.trim(),
        siteNameKhmer: data.siteNameKhmer?.trim() || null,
        siteSubtitle: data.siteSubtitle?.trim() || "Travel & Seasonal Guides",
        siteSubtitleKhmer: data.siteSubtitleKhmer?.trim() || null,
        logoUrl: data.logoUrl || "/logo.png",
        logoKhmerUrl: data.logoKhmerUrl || "/logo-khmer.png",
        description: data.description?.trim() || "",
        descriptionKhmer: data.descriptionKhmer?.trim() || null,
      },
      create: {
        id: "default",
        siteName: data.siteName.trim(),
        siteNameKhmer: data.siteNameKhmer?.trim() || null,
        siteSubtitle: data.siteSubtitle?.trim() || "Travel & Seasonal Guides",
        siteSubtitleKhmer: data.siteSubtitleKhmer?.trim() || null,
        logoUrl: data.logoUrl || "/logo.png",
        logoKhmerUrl: data.logoKhmerUrl || "/logo-khmer.png",
        description: data.description?.trim() || "",
        descriptionKhmer: data.descriptionKhmer?.trim() || null,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");

    return { success: true, settings };
  } catch (error: any) {
    console.error("Error updating site settings:", error);
    return { success: false, error: error.message || "Failed to update settings" };
  }
}
