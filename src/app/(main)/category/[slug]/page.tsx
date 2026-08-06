import React from "react";
import { notFound } from "next/navigation";
import { getPublishedArticles } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { getNavItems } from "@/actions/navbar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArticleCard } from "@/components/news/article-card";
import { Folder } from "lucide-react";

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [categories, navItems] = await Promise.all([
    getCategories(),
    getNavItems(),
  ]);

  const currentCategory = categories.find((c) => c.slug === params.slug);

  if (!currentCategory) {
    notFound();
  }

  const { articles } = await getPublishedArticles({ categorySlug: params.slug, limit: 20 });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar categories={categories} navItems={navItems} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Category Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Folder className="w-4 h-4" /> Category Archive
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white capitalize">
            {currentCategory.name}
          </h1>
          {currentCategory.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {currentCategory.description}
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-500 space-y-3 border border-slate-200 dark:border-slate-800">
            <p className="font-semibold text-[#2791F5]">No articles published in this category yet.</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
