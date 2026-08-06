import React from "react";
import { getPublishedArticles } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArticleCard } from "@/components/news/article-card";
import { Tag } from "lucide-react";

interface TagPageProps {
  params: { slug: string };
}

export default async function TagPage({ params }: TagPageProps) {
  const categories = await getCategories();
  const { articles } = await getPublishedArticles({ tagSlug: params.slug, limit: 20 });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar categories={categories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Tag className="w-4 h-4" /> Tag Archive
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white capitalize">
            #{params.slug}
          </h1>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <p className="text-lg text-slate-500 font-medium">No articles found tagged with #{params.slug}.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
