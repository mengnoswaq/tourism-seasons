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
    return [
      { id: "1", name: "Technology", slug: "technology", description: "Tech & AI", status: "ACTIVE", _count: { articles: 1 } },
      { id: "2", name: "World", slug: "world", description: "Global News", status: "ACTIVE", _count: { articles: 0 } },
      { id: "3", name: "Business", slug: "business", description: "Economy & Markets", status: "ACTIVE", _count: { articles: 0 } },
      { id: "4", name: "Science", slug: "science", description: "Space & Discovery", status: "ACTIVE", _count: { articles: 1 } },
    ];
  }
}

export async function getTags() {
  try {
    return await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  } catch (error) {
    return [];
  }
}

export async function toggleCategoryActiveStatus(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR"])) {
    return { success: false, error: "Permission denied." };
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

export async function createCategory(name: string, description?: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR"])) {
    return { success: false, error: "Permission denied." };
  }

  const slug = slugify(name);
  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        status: "ACTIVE",
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");

    return { success: true, message: "Category created successfully.", data: category };
  } catch (error) {
    return { success: false, error: "Failed to create category." };
  }
}

export async function updateCategory(id: string, name: string, description?: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR"])) {
    return { success: false, error: "Permission denied." };
  }

  const slug = slugify(name);

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");

    return { success: true, message: "Navbar Category updated successfully." };
  } catch (error) {
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can delete navbar items." };
  }

  try {
    await prisma.category.delete({ where: { id } });

    revalidatePath("/", "layout");
    revalidatePath("/admin/categories");

    return { success: true, message: "Navbar Category deleted." };
  } catch (error) {
    return { success: false, error: "Cannot delete category with associated articles." };
  }
}
