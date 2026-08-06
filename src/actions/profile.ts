"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ApiResponse } from "@/types";

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
