"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { redirect } from "next/navigation";

export interface NavItemInput {
  label: string;
  labelKhmer?: string | null;
  type?: string;
  targetId?: string | null;
  url: string;
  order?: number;
  status?: string;
}

export async function getNavItems() {
  try {
    return await prisma.navItem.findMany({
      where: { status: "ACTIVE" },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    return [];
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

export async function createNavItem(data: NavItemInput): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can add navbar items." };
  }

  if (!data.label || !data.url) {
    return { success: false, error: "Label and URL are required." };
  }

  try {
    await prisma.navItem.create({
      data: {
        label: data.label.trim(),
        labelKhmer: data.labelKhmer?.trim() || null,
        type: data.type || "CUSTOM",
        targetId: data.targetId || null,
        url: data.url.trim(),
        order: data.order || 0,
        status: data.status || "ACTIVE",
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

export async function updateNavItem(id: string, data: NavItemInput): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can edit navbar items." };
  }

  if (!data.label || !data.url) {
    return { success: false, error: "Label and URL are required." };
  }

  try {
    await prisma.navItem.update({
      where: { id },
      data: {
        label: data.label.trim(),
        labelKhmer: data.labelKhmer?.trim() || null,
        type: data.type || "CUSTOM",
        targetId: data.targetId || null,
        url: data.url.trim(),
        order: data.order !== undefined ? data.order : 0,
        status: data.status || "ACTIVE",
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

export async function reorderNavItems(items: { id: string; order: number }[]): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied." };
  }

  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.navItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    revalidatePath("/", "layout");
    revalidatePath("/admin/navbar");

    return { success: true, message: "Navbar order updated successfully." };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to reorder navbar items." };
  }
}

export async function deleteAllNavItems(): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can clear navbar items." };
  }

  try {
    await prisma.navItem.deleteMany({});

    revalidatePath("/", "layout");
    revalidatePath("/admin/navbar");

    return { success: true, message: "All navbar items have been deleted." };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to clear navbar items." };
  }
}
