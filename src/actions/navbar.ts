"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { redirect } from "next/navigation";

export async function getNavItems() {
  try {
    const items = await prisma.navItem.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
    });
    if (items.length > 0) return items;

    return [
      { id: "1", label: "All News", url: "/", order: 1, status: "ACTIVE" },
      { id: "2", label: "Technology", url: "/category/technology", order: 2, status: "ACTIVE" },
      { id: "3", label: "World", url: "/category/world", order: 3, status: "ACTIVE" },
      { id: "4", label: "Business", url: "/category/business", order: 4, status: "ACTIVE" },
      { id: "5", label: "Culture", url: "/category/culture", order: 5, status: "ACTIVE" },
      { id: "6", label: "Science", url: "/category/science", order: 6, status: "ACTIVE" },
    ];
  } catch (error) {
    return [
      { id: "1", label: "All News", url: "/", order: 1, status: "ACTIVE" },
      { id: "2", label: "Technology", url: "/category/technology", order: 2, status: "ACTIVE" },
      { id: "3", label: "World", url: "/category/world", order: 3, status: "ACTIVE" },
      { id: "4", label: "Business", url: "/category/business", order: 4, status: "ACTIVE" },
      { id: "5", label: "Culture", url: "/category/culture", order: 5, status: "ACTIVE" },
      { id: "6", label: "Science", url: "/category/science", order: 6, status: "ACTIVE" },
    ];
  }
}

export async function getAllNavItems() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/navbar");
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    redirect("/admin");
  }

  try {
    return await prisma.navItem.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    return [];
  }
}

export async function createNavItem(label: string, url: string, order?: number): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can add navbar items." };
  }

  if (!label || !url) {
    return { success: false, error: "Label and URL are required." };
  }

  try {
    await prisma.navItem.create({
      data: {
        label,
        url,
        order: order || 0,
        status: "ACTIVE",
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/navbar");

    return { success: true, message: "Navbar item added successfully!" };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create navbar item." };
  }
}

export async function toggleNavItemStatus(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied." };
  }

  const existing = await prisma.navItem.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Navbar item not found." };
  }

  const newStatus = existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.navItem.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/navbar");

  return { success: true, message: `Navbar item status updated to ${newStatus}.` };
}

export async function updateNavItem(id: string, label: string, url: string, order?: number): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can edit navbar items." };
  }

  if (!label || !url) {
    return { success: false, error: "Label and URL are required." };
  }

  try {
    await prisma.navItem.update({
      where: { id },
      data: {
        label,
        url,
        order: order !== undefined ? order : 0,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/navbar");

    return { success: true, message: "Navbar item updated successfully!" };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update navbar item." };
  }
}

export async function deleteNavItem(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied." };
  }

  try {
    await prisma.navItem.delete({ where: { id } });

    revalidatePath("/", "layout");
    revalidatePath("/admin/navbar");

    return { success: true, message: "Navbar item deleted." };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete navbar item." };
  }
}
