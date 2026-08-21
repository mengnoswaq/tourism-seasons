"use server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { ApiResponse } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";

export async function getProvinces() {
  try {
    return await prisma.province.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch provinces:", error);
    return [];
  }
}

export async function getAllProvincesAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) return [];

  try {
    return await prisma.province.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin provinces:", error);
    return [];
  }
}

export async function getProvinceBySlug(slug: string) {
  try {
    return await prisma.province.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch province by slug:", error);
    return null;
  }
}

export interface ProvinceInput {
  name: string;
  nameKhmer?: string;
  code?: string;
  image?: string;
  description?: string;
  descriptionKhmer?: string;
  status?: string;
}

export async function createProvince(data: ProvinceInput): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized." };

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can create provinces." };
  }

  try {
    const slug = slugify(data.name);
    const existing = await prisma.province.findFirst({
      where: { OR: [{ slug }, { name: data.name }] },
    });

    if (existing) return { success: false, error: "Province already exists." };

    const province = await prisma.province.create({
      data: {
        name: data.name.trim(),
        nameKhmer: data.nameKhmer?.trim() || null,
        slug,
        code: data.code?.trim() || null,
        image: data.image?.trim() || null,
        description: data.description?.trim() || null,
        descriptionKhmer: data.descriptionKhmer?.trim() || null,
        status: data.status || "ACTIVE",
      },
    });

    return { success: true, data: province };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create province." };
  }
}

export async function updateProvince(id: string, data: ProvinceInput): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized." };

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can update provinces." };
  }

  try {
    const slug = slugify(data.name);
    const province = await prisma.province.update({
      where: { id },
      data: {
        name: data.name.trim(),
        nameKhmer: data.nameKhmer?.trim() || null,
        slug,
        code: data.code?.trim() || null,
        image: data.image?.trim() || null,
        description: data.description?.trim() || null,
        descriptionKhmer: data.descriptionKhmer?.trim() || null,
        status: data.status,
      },
    });

    return { success: true, data: province };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update province." };
  }
}

export async function toggleProvinceStatus(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized." };

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can modify province status." };
  }

  try {
    const existing = await prisma.province.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Province not found." };

    const updated = await prisma.province.update({
      where: { id },
      data: { status: existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}

export async function deleteProvince(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized." };

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can delete provinces." };
  }

  try {
    await prisma.province.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete province." };
  }
}
