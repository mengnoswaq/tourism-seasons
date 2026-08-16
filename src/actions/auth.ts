"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";

export async function registerUser(formData: FormData): Promise<ApiResponse> {
  const name = (formData.get("name") as string)?.trim();
  const rawEmail = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!name || name.length < 2) {
    return { success: false, error: "Please enter a valid full name (at least 2 characters)." };
  }

  if (!rawEmail) {
    return { success: false, error: "Email address is required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(rawEmail)) {
    return { success: false, error: "Please enter a valid email address format (e.g. user@gmail.com)." };
  }

  const email = rawEmail.toLowerCase();

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long for security." };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return { success: false, error: "An account with this email address already exists. Please log in instead." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const role = "USER";

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      status: "ACTIVE",
    },
  });

  return {
    success: true,
    message: "Registration successful. You can now log in with your credentials.",
    data: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}
