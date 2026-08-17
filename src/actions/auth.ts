"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";
import { sendEmail, generateVerificationHtml } from "@/lib/mail";

// Helper function to validate real email addresses
function isRealEmail(email: string): boolean {
  if (!email) return false;
  const emailLower = email.trim().toLowerCase();
  
  // Standard email format regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(emailLower)) return false;

  // Block obvious test / fake email domain extensions
  const fakeDomains = ["example.com", "test.com", "sample.com", "invalid.com", "domain.com", "foo.bar"];
  const domain = emailLower.split("@")[1];
  if (fakeDomains.includes(domain)) return false;

  return true;
}

// 1. Send Verification Code for Registration
export async function sendRegisterVerificationCode(rawEmail: string): Promise<ApiResponse> {
  const email = rawEmail?.trim().toLowerCase();

  if (!email || !isRealEmail(email)) {
    return {
      success: false,
      error: "Please enter a valid, real email address (e.g. name@gmail.com).",
    };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      error: "An account with this email address already exists. Please log in instead.",
    };
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Clean up any old register code for this email and save new code
  await prisma.verificationCode.deleteMany({
    where: { email, type: "REGISTER" },
  });

  await prisma.verificationCode.create({
    data: {
      email,
      code,
      type: "REGISTER",
      expiresAt,
    },
  });

  // Send verification email to Gmail
  const html = generateVerificationHtml(code, "Verify Your Registration Email");
  const mailResult = await sendEmail({
    to: email,
    subject: `Your Verification Code: ${code} - Tourism Seasons`,
    html,
  });

  if (!mailResult.success) {
    return {
      success: false,
      error: `Failed to deliver verification code to ${email}. Please ensure it is a valid email.`,
    };
  }

  return {
    success: true,
    message: `Verification code sent to ${email}. Please check your inbox!`,
  };
}

// 2. Complete Registration with Verification Code
export async function registerUserWithVerification(formData: FormData): Promise<ApiResponse> {
  const name = (formData.get("name") as string)?.trim();
  const rawEmail = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const code = (formData.get("code") as string)?.trim();

  if (!name || name.length < 2) {
    return { success: false, error: "Please enter a valid full name (at least 2 characters)." };
  }

  if (!rawEmail || !isRealEmail(rawEmail)) {
    return { success: false, error: "Please enter a valid, real email address (e.g. name@gmail.com)." };
  }

  const email = rawEmail.toLowerCase();

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (!code || code.length !== 6) {
    return { success: false, error: "Please enter the complete 6-digit verification code sent to your email." };
  }

  // Verify code from database
  const record = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      type: "REGISTER",
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return {
      success: false,
      error: "Invalid or expired verification code. Please check your email or request a new code.",
    };
  }

  // Check if account was created in the meantime
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return { success: false, error: "An account with this email address already exists. Please log in instead." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "USER",
      status: "ACTIVE",
    },
  });

  // Delete used verification code
  await prisma.verificationCode.deleteMany({
    where: { email, type: "REGISTER" },
  });

  return {
    success: true,
    message: "Registration successful! Redirecting to login...",
    data: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

// 3. Send Verification Code for Forgot Password
export async function sendForgotPasswordCode(rawEmail: string): Promise<ApiResponse> {
  const email = rawEmail?.trim().toLowerCase();

  if (!email || !isRealEmail(email)) {
    return {
      success: false,
      error: "Please enter a valid, real email address.",
    };
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    return {
      success: false,
      error: "No account found with this email address. Please check your typing or register a new account.",
    };
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Clean up any old forgot code for this email and save new code
  await prisma.verificationCode.deleteMany({
    where: { email, type: "FORGOT_PASSWORD" },
  });

  await prisma.verificationCode.create({
    data: {
      email,
      code,
      type: "FORGOT_PASSWORD",
      expiresAt,
    },
  });

  // Send email via Nodemailer
  const html = generateVerificationHtml(code, "Reset Your Account Password");
  const mailResult = await sendEmail({
    to: email,
    subject: `Password Reset Code: ${code} - Tourism Seasons`,
    html,
  });

  if (!mailResult.success) {
    return {
      success: false,
      error: `Failed to deliver reset code to ${email}. Please check your email address.`,
    };
  }

  return {
    success: true,
    message: `Password reset code sent to ${email}. Please check your inbox!`,
  };
}

// 4. Reset Password with Verification Code
export async function resetPasswordWithCode(formData: FormData): Promise<ApiResponse> {
  const rawEmail = (formData.get("email") as string)?.trim();
  const code = (formData.get("code") as string)?.trim();
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!rawEmail || !isRealEmail(rawEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const email = rawEmail.toLowerCase();

  if (!code || code.length !== 6) {
    return { success: false, error: "Please enter the 6-digit verification code sent to your email." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New password and confirm password do not match." };
  }

  // Verify OTP code
  const record = await prisma.verificationCode.findFirst({
    where: {
      email,
      code,
      type: "FORGOT_PASSWORD",
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    return {
      success: false,
      error: "Invalid or expired reset code. Please request a new code.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { success: false, error: "User account not found." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Delete used code
  await prisma.verificationCode.deleteMany({
    where: { email, type: "FORGOT_PASSWORD" },
  });

  return {
    success: true,
    message: "Password reset successful! You can now log in with your new password.",
  };
}

// Standard fallback registerUser
export async function registerUser(formData: FormData): Promise<ApiResponse> {
  return registerUserWithVerification(formData);
}
