"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { ArticleFilterParams, ApiResponse } from "@/types";

export async function getPublishedArticles(params: ArticleFilterParams = {}) {
  try {
    const { categorySlug, provinceSlug, search, page = 1, limit = 10, featured } = params;

    const where: any = {
      published: true,
    };

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (provinceSlug) {
      where.province = { slug: provinceSlug };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const sortOrder: any = params.orderBy === "views" 
      ? [{ views: "desc" }, { createdAt: "desc" }] 
      : [{ publishedAt: "desc" }, { createdAt: "desc" }];

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, image: true, email: true, role: true, bio: true, createdAt: true, updatedAt: true },
          },
          category: true,
          province: true,
          images: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: sortOrder,
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
        province: true,
        images: {
          orderBy: { order: "asc" },
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

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"])) {
    return { success: false, error: "Permission denied." };
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

  const userRole = (session.user as any).role as string;
  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"])) {
    return { success: false, error: "Permission denied." };
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

  const title = (formData.get("title") as string)?.trim() || null;
  const titleKhmer = (formData.get("titleKhmer") as string)?.trim() || null;
  const summary = (formData.get("summary") as string)?.trim() || null;
  const summaryKhmer = (formData.get("summaryKhmer") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim() || null;
  const contentKhmer = (formData.get("contentKhmer") as string)?.trim() || null;
  const categoryId = (formData.get("categoryId") as string)?.trim();
  const provinceId = (formData.get("provinceId") as string)?.trim() || null;
  const coverImage = formData.get("coverImage") as string;
  const youtubeUrl = formData.get("youtubeUrl") as string;
  const imagesRaw = formData.get("images") as string;
  const published = formData.get("published") === "true";
  const featured = formData.get("featured") === "true";
  const tagNamesStr = formData.get("tags") as string;

  const hasTitle = Boolean(title || titleKhmer);
  const hasSummary = Boolean(summary || summaryKhmer);
  const hasContent = Boolean(content || contentKhmer);

  if (!hasTitle || !hasSummary || !hasContent || !categoryId) {
    return { success: false, error: "Article title, summary, content (in English or Khmer), and category are required." };
  }

  const textToSlug = title || titleKhmer || "article";
  const rawSlug = slugify(textToSlug) || `story-${Date.now()}`;
  const existingSlug = await prisma.article.findUnique({ where: { slug: rawSlug } });
  const slug = existingSlug ? `${rawSlug}-${Date.now().toString().slice(-4)}` : rawSlug;

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

  const finalTitle = title || titleKhmer || "Untitled Article";
  const finalSummary = summary || summaryKhmer || "";
  const finalContent = content || contentKhmer || "";

  const article = await prisma.article.create({
    data: {
      title: finalTitle,
      titleKhmer,
      slug,
      summary: finalSummary,
      summaryKhmer,
      content: finalContent,
      contentKhmer,
      coverImage: coverImage || null,
      youtubeUrl: youtubeUrl || null,
      published,
      featured,
      publishedAt: published ? new Date() : null,
      authorId: (session.user as any).id,
      categoryId,
      provinceId: provinceId || null,
      images: {
        create: galleryImages,
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

  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"])) {
    return { success: false, error: "Permission denied." };
  }

  if (existing.authorId !== userId && !hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR"])) {
    return { success: false, error: "Permission denied. You can only edit your own articles." };
  }

  const title = formData.get("title") as string;
  const titleKhmer = (formData.get("titleKhmer") as string)?.trim() || null;
  const summary = formData.get("summary") as string;
  const summaryKhmer = (formData.get("summaryKhmer") as string)?.trim() || null;
  const content = formData.get("content") as string;
  const contentKhmer = (formData.get("contentKhmer") as string)?.trim() || null;
  const categoryId = formData.get("categoryId") as string;
  const provinceId = (formData.get("provinceId") as string)?.trim() || null;
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

  const finalTitle = title || titleKhmer || existing.title;
  const finalSummary = summary || summaryKhmer || existing.summary;
  const finalContent = content || contentKhmer || existing.content;

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: finalTitle,
      titleKhmer,
      summary: finalSummary,
      summaryKhmer,
      content: finalContent,
      contentKhmer,
      coverImage: coverImage || existing.coverImage,
      youtubeUrl: youtubeUrl !== undefined ? (youtubeUrl || null) : existing.youtubeUrl,
      categoryId,
      provinceId: provinceId || existing.provinceId,
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

  if (!hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR", "AUTHOR"])) {
    return { success: false, error: "Permission denied." };
  }

  if (existing.authorId !== userId && !hasPermission(userRole, ["SUPERADMIN", "ADMIN", "EDITOR"])) {
    return { success: false, error: "Permission denied." };
  }

  await prisma.article.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/articles");

  return { success: true, message: "Article deleted." };
}
