"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";

export async function registerUser(formData: FormData): Promise<ApiResponse> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { success: false, error: "Name, email, and password are required." };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  // All public registrations are automatically assigned default USER role
  const role = "USER";

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  });

  return {
    success: true,
    message: "Registration successful. You can now log in.",
    data: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}
