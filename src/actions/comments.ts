"use server";

import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getArticleComments(articleId: string) {
  try {
    return await prisma.comment.findMany({
      where: {
        articleId,
        status: "APPROVED",
        parentId: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, image: true, bio: true, bioKhmer: true },
        },
        children: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, image: true, bio: true, bioKhmer: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch article comments:", error);
    return [];
  }
}

export async function createComment(
  articleId: string,
  content: string,
  parentId?: string
): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "You must be signed in to post a comment." };
  }

  if (!content || !content.trim()) {
    return { success: false, error: "Comment content cannot be empty." };
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        articleId,
        authorId: (session.user as any).id,
        parentId: parentId || null,
        status: "APPROVED",
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, bio: true, bioKhmer: true },
        },
      },
    });

    return { success: true, data: comment };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to post comment." };
  }
}

export const addComment = createComment;

export async function getAllCommentsAdmin() {
  try {
    return await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, image: true, email: true },
        },
        article: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin comments:", error);
    return [];
  }
}

export async function toggleCommentStatusAdmin(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized." };

  try {
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Comment not found." };

    const updated = await prisma.comment.update({
      where: { id },
      data: { status: existing.status === "APPROVED" ? "REJECTED" : "APPROVED" },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle comment status." };
  }
}

export async function deleteCommentAdmin(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized." };

  try {
    await prisma.comment.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete comment." };
  }
}
