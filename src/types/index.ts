import { Article, ArticleImage, Category, Comment, Tag, User } from "@prisma/client";

export type Role = "SUPERADMIN" | "ADMIN" | "EDITOR" | "AUTHOR" | "USER";

export type SafeUser = Omit<User, "passwordHash">;

export type ArticleWithRelations = Article & {
  author: SafeUser;
  category: Category;
  tags: { tag: Tag }[];
  images?: ArticleImage[];
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
  tagSlug?: string;
  search?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}
