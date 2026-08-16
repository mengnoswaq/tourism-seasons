"use server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { ApiResponse } from "@/types";

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch categories from database:", error);
    return [];
  }
}



export async function toggleCategoryActiveStatus(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Admin role required." };
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Category not found." };
  }

  const newStatus = existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.category.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");

  return { success: true, message: `Navbar category status updated to ${newStatus}.` };
}

export async function createCategory(
  name?: string,
  description?: string,
  nameKhmer?: string,
  descriptionKhmer?: string
): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Admin role required." };
  }

  const enName = name?.trim() || null;
  const khName = nameKhmer?.trim() || null;

  if (!enName && !khName) {
    return { success: false, error: "Category Name (in English or Khmer) is required." };
  }

  const finalName = enName || khName || "Category";
  const textToSlug = enName || khName || "category";
  const rawSlug = slugify(textToSlug) || `category-${Date.now()}`;
  const existingSlug = await prisma.category.findUnique({ where: { slug: rawSlug } });
  const slug = existingSlug ? `${rawSlug}-${Date.now().toString().slice(-4)}` : rawSlug;

  try {
    const category = await prisma.category.create({
      data: {
        name: finalName,
        nameKhmer: khName,
        slug,
        description: description?.trim() || null,
        descriptionKhmer: descriptionKhmer?.trim() || null,
        status: "ACTIVE",
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");

    return { success: true, message: "Category created successfully.", data: category };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create category." };
  }
}

export async function updateCategory(
  id: string,
  name?: string,
  description?: string,
  nameKhmer?: string,
  descriptionKhmer?: string
): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Admin role required." };
  }

  const enName = name?.trim() || null;
  const khName = nameKhmer?.trim() || null;

  if (!enName && !khName) {
    return { success: false, error: "Category Name (in English or Khmer) is required." };
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  const finalName = enName || khName || existing?.name || "Category";

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: finalName,
        nameKhmer: khName,
        description: description?.trim() || null,
        descriptionKhmer: descriptionKhmer?.trim() || null,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");

    return { success: true, message: "Category updated successfully." };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update category." };
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Admin role required." };
  }

  try {
    await prisma.category.delete({ where: { id } });

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");

    return { success: true, message: "Category deleted successfully." };
  } catch (error) {
    return { success: false, error: "Cannot delete category with associated articles." };
  }
}
