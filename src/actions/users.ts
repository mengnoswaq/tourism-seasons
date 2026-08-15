"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { redirect } from "next/navigation";

export async function getUsers() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/users");
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN"])) {
    redirect("/admin");
  }

  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      image: true,
      bio: true,
      createdAt: true,
      _count: {
        select: { articles: true, comments: true },
      },
    },
  });
}

export async function toggleUserActiveStatus(targetUserId: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const currentRole = (session.user as any).role as string;
  const currentUserId = (session.user as any).id;

  if (!hasPermission(currentRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can modify user status." };
  }

  if (targetUserId === currentUserId) {
    return { success: false, error: "You cannot deactivate your own account." };
  }

  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) {
    return { success: false, error: "User not found." };
  }

  // Security check: Only SUPERADMIN can modify a SUPERADMIN or ADMIN user's status
  if ((existing.role === "SUPERADMIN" || existing.role === "ADMIN") && currentRole !== "SUPERADMIN") {
    return { success: false, error: "Permission denied. Only a Super Admin can modify an Admin or Super Admin status." };
  }

  const newStatus = existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.user.update({
    where: { id: targetUserId },
    data: { status: newStatus },
  });

  revalidatePath("/admin/users");

  return { success: true, message: `User status updated to ${newStatus}.` };
}

export async function updateUserRole(targetUserId: string, newRole: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const currentRole = (session.user as any).role as string;
  const currentUserId = (session.user as any).id;

  if (!hasPermission(currentRole, ["SUPERADMIN", "ADMIN"])) {
    return { success: false, error: "Permission denied. Only Super Admin or Admin can modify roles." };
  }

  const validRoles = ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR", "USER"];
  if (!validRoles.includes(newRole)) {
    return { success: false, error: "Invalid role specified." };
  }

  if (targetUserId === currentUserId && newRole !== currentRole) {
    return { success: false, error: "You cannot modify your own role." };
  }

  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) {
    return { success: false, error: "User not found." };
  }

  // Security check: Only SUPERADMIN can modify a SUPERADMIN or ADMIN user's role
  if ((existing.role === "SUPERADMIN" || existing.role === "ADMIN") && currentRole !== "SUPERADMIN") {
    return { success: false, error: "Permission denied. Only a Super Admin can modify an Admin or Super Admin role." };
  }

  // Security check: Only SUPERADMIN can assign the SUPERADMIN role
  if (newRole === "SUPERADMIN" && currentRole !== "SUPERADMIN") {
    return { success: false, error: "Permission denied. Only a Super Admin can assign the Super Admin role." };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { success: true, message: `User role successfully updated to ${newRole}.` };
}
