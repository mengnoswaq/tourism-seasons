import React from "react";
import { getPublishedArticles } from "@/actions/articles";
import { getCategories } from "@/actions/categories";
import { getNavItems } from "@/actions/navbar";
import { getSiteSettings } from "@/actions/settings";
import { getProvinces } from "@/actions/provinces";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LatestHeadlinesHeader } from "@/components/news/latest-headlines-header";
import { HeroFeatured } from "@/components/news/hero-featured";
import { ArticleCard } from "@/components/news/article-card";
import { TrendingWidget } from "@/components/news/trending-widget";
import { ProvinceFilterSection } from "@/components/news/province-filter-section";

export const revalidate = 60; // Incremental Static Regeneration (ISR) every 60 seconds

export default async function HomePage() {
  const [categories, navItems, { articles }, { settings }, provinces] = await Promise.all([
    getCategories(),
    getNavItems(),
    getPublishedArticles({ limit: 16 }),
    getSiteSettings(),
    getProvinces(),
  ]);

  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  // Show only 4 articles in the main Latest Headlines grid
  const regularArticles = articles.filter((a) => a.id !== featuredArticle?.id).slice(0, 4);

  const headlines = articles.map((a) => a.title);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar categories={categories} navItems={navItems} headlines={headlines} siteSettings={settings} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Featured Hero Story */}
        {featuredArticle && (
          <section className="space-y-4">
            <HeroFeatured article={featuredArticle} />
          </section>
        )}

        {/* Main Content Grid: Latest Stories + Sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Latest News Grid + Province Filter */}
          <div className="lg:col-span-2 space-y-10">
            {/* Latest Headlines Section (Limited to 4 articles) */}
            <div className="space-y-6">
              <LatestHeadlinesHeader />

              {regularArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {regularArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                  No additional headlines to display. Publish more articles to see them listed here.
                </div>
              )}
            </div>

            {/* Province Filter Section (Bottom of Latest Headlines) */}
            <ProvinceFilterSection provinces={provinces} allArticles={articles} />
          </div>

          {/* Right Column: Trending Sidebar */}
          <aside className="space-y-6">
            <TrendingWidget articles={articles.slice(0, 5)} />
          </aside>

        </section>

      </main>

      <Footer siteSettings={settings} />
    </div>
  );
}
