"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { ArticleFilterParams, ApiResponse } from "@/types";

export async function getPublishedArticles(params: ArticleFilterParams = {}) {
  try {
    const { categorySlug, tagSlug, search, page = 1, limit = 10, featured } = params;

    const where: any = {
      published: true,
    };

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (tagSlug) {
      where.tags = {
        some: {
          tag: { slug: tagSlug },
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, image: true, email: true, role: true, bio: true, createdAt: true, updatedAt: true },
          },
          category: true,
          images: {
            orderBy: { order: "asc" },
          },
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return {
      articles: articles as any[],
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch articles from database:", error);
    return {
      articles: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, image: true, email: true, role: true, bio: true, createdAt: true, updatedAt: true },
        },
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    return article as any;
  } catch (error) {
    console.error("Failed to fetch article by slug:", error);
    return null;
  }
}

export async function toggleArticlePublishedStatus(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized." };
  }

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Article not found." };
  }

  const updated = await prisma.article.update({
    where: { id },
    data: {
      published: !existing.published,
      publishedAt: !existing.published ? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/articles");

  return {
    success: true,
    message: `Article status updated to ${updated.published ? "Active (Published)" : "Inactive (Draft)"}`,
  };
}

export async function toggleArticleFeaturedStatus(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized." };
  }

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Article not found." };
  }

  const updated = await prisma.article.update({
    where: { id },
    data: {
      featured: !existing.featured,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/articles");

  return {
    success: true,
    message: `Article featured status updated to ${updated.featured ? "Featured" : "Regular"}`,
  };
}

export async function incrementArticleViews(articleId: string, ipAddress?: string, userAgent?: string) {
  try {
    await prisma.$transaction([
      prisma.article.update({
        where: { id: articleId },
        data: { views: { increment: 1 } },
      }),
      prisma.articleView.create({
        data: {
          articleId,
          ipAddress: ipAddress || "127.0.0.1",
          userAgent: userAgent || "unknown",
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to increment views:", error);
  }
}

export async function createArticle(formData: FormData): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"])) {
    return { success: false, error: "Permission denied. Author, Editor, or Admin role required." };
  }

  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;
  const coverImage = formData.get("coverImage") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;
  const imagesRaw = formData.get("images") as string;
  const published = formData.get("published") === "true";
  const featured = formData.get("featured") === "true";
  const tagNamesStr = formData.get("tags") as string;

  if (!title || !summary || !content || !categoryId) {
    return { success: false, error: "Title, summary, content, and category are required." };
  }

  const baseSlug = slugify(title);
  const existingSlug = await prisma.article.findUnique({ where: { slug: baseSlug } });
  const slug = existingSlug ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  const tagNames = tagNamesStr ? tagNamesStr.split(",").map((t) => t.trim()).filter(Boolean) : [];

  let galleryImages: { url: string; caption?: string | null; order: number }[] = [];
  if (imagesRaw) {
    try {
      const parsed = JSON.parse(imagesRaw);
      if (Array.isArray(parsed)) {
        galleryImages = parsed
          .filter((img: any) => img && typeof img.url === "string" && img.url.trim() !== "")
          .map((img: any, idx: number) => ({
            url: img.url.trim(),
            caption: img.caption ? String(img.caption).trim() : null,
            order: idx,
          }));
      }
    } catch (e) {}
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      summary,
      content,
      coverImage: coverImage || null,
      youtubeUrl: youtubeUrl || null,
      published,
      featured,
      publishedAt: published ? new Date() : null,
      authorId: (session.user as any).id,
      categoryId,
      images: {
        create: galleryImages,
      },
      tags: {
        create: await Promise.all(
          tagNames.map(async (tagName) => {
            const tagSlug = slugify(tagName);
            const tag = await prisma.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: { name: tagName, slug: tagSlug },
            });
            return { tagId: tag.id };
          })
        ),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/articles");

  return { success: true, data: article, message: "Article created successfully." };
}

export async function updateArticle(id: string, formData: FormData): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized." };
  }

  const userRole = (session.user as any).role as string;
  const userId = (session.user as any).id;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Article not found." };
  }

  if (existing.authorId !== userId && !hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR"])) {
    return { success: false, error: "Permission denied. You can only edit your own articles." };
  }

  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;
  const coverImage = formData.get("coverImage") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;
  const imagesRaw = formData.get("images") as string;
  const published = formData.get("published") === "true";
  const featured = formData.get("featured") === "true";

  // Update gallery images if provided
  if (imagesRaw !== null && imagesRaw !== undefined) {
    try {
      const parsed = JSON.parse(imagesRaw);
      if (Array.isArray(parsed)) {
        await prisma.articleImage.deleteMany({ where: { articleId: id } });
        const galleryImages = parsed
          .filter((img: any) => img && typeof img.url === "string" && img.url.trim() !== "")
          .map((img: any, idx: number) => ({
            articleId: id,
            url: img.url.trim(),
            caption: img.caption ? String(img.caption).trim() : null,
            order: idx,
          }));

        if (galleryImages.length > 0) {
          await prisma.articleImage.createMany({
            data: galleryImages,
          });
        }
      }
    } catch (e) {}
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title,
      summary,
      content,
      coverImage: coverImage || existing.coverImage,
      youtubeUrl: youtubeUrl !== undefined ? (youtubeUrl || null) : existing.youtubeUrl,
      categoryId,
      published,
      featured,
      publishedAt: published && !existing.published ? new Date() : existing.publishedAt,
    },
  });

  revalidatePath("/");
  revalidatePath(`/articles/${existing.slug}`);
  revalidatePath("/admin/articles");

  return { success: true, data: article, message: "Article updated successfully." };
}

export async function deleteArticle(id: string): Promise<ApiResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized." };
  }

  const userRole = (session.user as any).role as string;
  const userId = (session.user as any).id;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Article not found." };
  }

  if (existing.authorId !== userId && !hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR"])) {
    return { success: false, error: "Permission denied." };
  }

  await prisma.article.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/articles");

  return { success: true, message: "Article deleted." };
}
