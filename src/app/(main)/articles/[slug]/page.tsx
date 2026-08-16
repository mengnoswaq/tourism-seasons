import React from "react";
import { notFound } from "next/navigation";
import { getArticleBySlug, incrementArticleViews, getPublishedArticles } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { getNavItems } from "@/actions/navbar";
import { getArticleComments } from "@/actions/comments";
import { generateArticleMetadata, generateNewsArticleJsonLd } from "@/lib/seo";
import { JsonLdScript } from "@/components/news/json-ld";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArticleDetailView } from "@/components/news/article-detail-view";

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  return generateArticleMetadata({
    title: article.title,
    summary: article.summary,
    slug: article.slug,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.author.name || undefined,
    categoryName: article.category.name,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article || !article.published) {
    notFound();
  }

  // Atomically increment article view count in background
  await incrementArticleViews(article.id);

  const [categories, navItems, comments, relatedRes, allArticlesRes] = await Promise.all([
    getCategories(),
    getNavItems(),
    getArticleComments(article.id),
    getPublishedArticles({ categorySlug: article.category.slug, limit: 4 }),
    getPublishedArticles({ orderBy: "views", limit: 6 }),
  ]);
  const relatedArticles = relatedRes.articles.filter((a: any) => a.id !== article.id).slice(0, 3);
  
  const filteredTrending = allArticlesRes.articles.filter((a: any) => a.id !== article.id);
  const trendingArticles = filteredTrending.length > 0 ? filteredTrending : allArticlesRes.articles;

  const jsonLdData = generateNewsArticleJsonLd({
    title: article.title,
    summary: article.summary,
    slug: article.slug,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.author.name || undefined,
    categoryName: article.category.name,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950">
      <JsonLdScript data={jsonLdData} />
      <Navbar categories={categories} navItems={navItems} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <ArticleDetailView
          article={article}
          comments={comments}
          relatedArticles={relatedArticles}
          trendingArticles={trendingArticles}
        />
      </main>

      <Footer />
    </div>
  );
}
