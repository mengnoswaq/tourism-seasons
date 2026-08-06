import React from "react";
import { getPublishedArticles } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArticleCard } from "@/components/news/article-card";
import { Search } from "lucide-react";

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const categories = await getCategories();
  const { articles, totalCount } = await getPublishedArticles({ search: query, limit: 20 });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar categories={categories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Search className="w-4 h-4" /> Search Results
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {query ? `Results for "${query}"` : "Search Articles"}
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Found {totalCount} matching articles
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <p className="text-lg text-slate-500 font-medium">No results match your search query.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
