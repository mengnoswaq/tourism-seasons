import { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SITE_NAME = "Tourism Seasons";

export interface ArticleSeoInput {
  title: string;
  summary: string;
  slug: string;
  coverImage?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  authorName?: string;
  categoryName?: string;
}

export function generateArticleMetadata(article: ArticleSeoInput): Metadata {
  const url = `${APP_URL}/articles/${article.slug}`;
  const imageUrl = article.coverImage || `${APP_URL}/api/og?title=${encodeURIComponent(article.title)}`;

  return {
    title: `${article.title} | ${SITE_NAME}`,
    description: article.summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
      authors: article.authorName ? [article.authorName] : undefined,
      section: article.categoryName,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [imageUrl],
    },
  };
}

export function generateNewsArticleJsonLd(article: ArticleSeoInput) {
  const url = `${APP_URL}/articles/${article.slug}`;
  const imageUrl = article.coverImage || `${APP_URL}/api/og?title=${encodeURIComponent(article.title)}`;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: article.title,
    description: article.summary,
    image: [imageUrl],
    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString(),
    author: {
      "@type": "Person",
      name: article.authorName || "Editorial Staff",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/logo.png`,
      },
    },
  };
}
