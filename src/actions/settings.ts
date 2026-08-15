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
          siteSubtitle: "Travel & Seasonal Guides",
          logoUrl: "/logo.png",
          logoKhmerUrl: "/logo-khmer.png",
          description:
            "Discover top travel destinations, seasonal vacation recommendations, local culture, and tourism insights across the world.",
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
        siteSubtitle: "Travel & Seasonal Guides",
        logoUrl: "/logo.png",
        logoKhmerUrl: "/logo-khmer.png",
        description:
          "Discover top travel destinations, seasonal vacation recommendations, local culture, and tourism insights across the world.",
      },
    };
  }
}

export async function updateSiteSettings(data: {
  siteName: string;
  siteSubtitle?: string;
  logoUrl?: string;
  logoKhmerUrl?: string;
  description?: string;
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
        siteSubtitle: data.siteSubtitle?.trim() || "Travel & Seasonal Guides",
        logoUrl: data.logoUrl || "/logo.png",
        logoKhmerUrl: data.logoKhmerUrl || "/logo-khmer.png",
        description: data.description?.trim() || "",
      },
      create: {
        id: "default",
        siteName: data.siteName.trim(),
        siteSubtitle: data.siteSubtitle?.trim() || "Travel & Seasonal Guides",
        logoUrl: data.logoUrl || "/logo.png",
        logoKhmerUrl: data.logoKhmerUrl || "/logo-khmer.png",
        description: data.description?.trim() || "",
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
