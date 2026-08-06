"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiResponse } from "@/types";

export async function getArticleComments(articleId: string) {
  const comments = await prisma.comment.findMany({
    where: {
      articleId,
      status: "APPROVED",
    },
    include: {
      author: {
        select: { id: true, name: true, image: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build recursive tree for nested comments
  const commentMap = new Map();
  const rootComments: any[] = [];

  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  comments.forEach((comment) => {
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId).children.push(commentMap.get(comment.id));
    } else if (!comment.parentId) {
      rootComments.push(commentMap.get(comment.id));
    }
  });

  return rootComments;
}

export async function addComment(
  articleId: string,
  content: string,
  parentId?: string
): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Please log in to submit a comment." };
  }

  if (!content || content.trim().length === 0) {
    return { success: false, error: "Comment text cannot be empty." };
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      articleId,
      authorId: (session.user as any).id,
      parentId: parentId || null,
      status: "APPROVED", // Auto approve for active users
    },
    include: {
      author: {
        select: { id: true, name: true, image: true, role: true },
      },
    },
  });

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });

  if (article) {
    revalidatePath(`/articles/${article.slug}`);
  }

  return { success: true, data: comment, message: "Comment posted." };
}
