import { Article, ArticleImage, Category, Comment, Province, User } from "@prisma/client";

export type Role = "SUPERADMIN" | "ADMIN" | "EDITOR" | "AUTHOR" | "USER";

export type SafeUser = Omit<User, "passwordHash"> & {
  bioKhmer?: string | null;
};

export type SafeCategory = Category & {
  nameKhmer?: string | null;
  descriptionKhmer?: string | null;
};

export type SafeProvince = Province & {
  nameKhmer?: string | null;
  descriptionKhmer?: string | null;
};

export type ArticleWithRelations = Article & {
  titleKhmer?: string | null;
  summaryKhmer?: string | null;
  contentKhmer?: string | null;
  seoTitleKhmer?: string | null;
  seoDescriptionKhmer?: string | null;
  author: SafeUser;
  category: SafeCategory;
  province?: SafeProvince | null;
  images?: (ArticleImage & { captionKhmer?: string | null })[];
  youtubeUrl?: string | null;
  _count?: {
    comments: number;
  };
};

export type CommentWithAuthor = Comment & {
  author: SafeUser;
  children?: CommentWithAuthor[];
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ArticleFilterParams {
  categorySlug?: string;
  provinceSlug?: string;
  search?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  orderBy?: "latest" | "views";
}
