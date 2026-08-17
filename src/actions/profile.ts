"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ApiResponse } from "@/types";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in to update your profile." };
  }

  const userId = (session.user as any).id;
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const removeImage = formData.get("removeImage") === "true";
  const image = formData.get("image") as string;

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Name cannot be empty." };
  }

  try {
    let imageValue: string | null = null;
    if (removeImage) {
      imageValue = null;
    } else if (image) {
      imageValue = image;
    } else {
      imageValue = (session.user as any).image || null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio: bio || null,
        image: imageValue,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/admin/users");
    revalidatePath("/", "layout");

    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    return { success: false, error: "Failed to update profile details." };
  }
}

export async function changePassword(formData: FormData): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in first." };
  }

  const userId = (session.user as any).id;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New password and confirm password do not match." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return { success: false, error: "User account not found." };
    }

    const hadExistingPassword = !!user.passwordHash;

    // If user has an existing password, verify current password
    if (hadExistingPassword) {
      if (!currentPassword) {
        return { success: false, error: "Current password is required." };
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash!);
      if (!isValid) {
        return { success: false, error: "Incorrect current password. Please try again." };
      }
    }

    // Hash the new password and update in database
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/admin/profile");

    return {
      success: true,
      message: hadExistingPassword
        ? "Password updated successfully!"
        : "Password created successfully! You can now log in using either Google or your email & password.",
    };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { success: false, error: "Failed to update password. Please try again." };
  }
}
