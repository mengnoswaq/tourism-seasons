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
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SocialShare } from "@/components/news/social-share";
import { CommentSection } from "@/components/comments/comment-section";
import { ArticleCard } from "@/components/news/article-card";
import { TrendingWidget } from "@/components/news/trending-widget";
import { formatDate, calculateReadingTime, getYouTubeEmbedUrl } from "@/lib/utils";
import { Clock, Eye, Calendar, Tag as TagIcon, PlayCircle, Image as ImageIcon, Flame } from "lucide-react";
import Link from "next/link";

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
    getPublishedArticles({ limit: 8 }),
  ]);
  const relatedArticles = relatedRes.articles.filter((a: any) => a.id !== article.id).slice(0, 3);
  const trendingArticles = allArticlesRes.articles.filter((a: any) => a.id !== article.id);
  const readingTime = calculateReadingTime(article.content);

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

  const articleUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/articles/${article.slug}`;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(article.youtubeUrl);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950">
      <JsonLdScript data={jsonLdData} />
      <Navbar categories={categories} navItems={navItems} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Article Content Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Article Header */}
            <header className="space-y-6 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Link href={`/category/${article.category.slug}`}>
                  <Badge variant="brand" className="text-xs px-3.5 py-1 font-semibold rounded-full bg-blue-50 text-[#2791F5] hover:bg-blue-100 border border-blue-200/50">
                    {article.category.name}
                  </Badge>
                </Link>
                <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {readingTime} min read
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.2]">
                {article.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                {article.summary}
              </p>

              {/* Meta Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-b border-slate-200/80 dark:border-slate-800 py-4 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <Avatar src={article.author.image} fallback={article.author.name || "A"} size="md" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm block">
                      {article.author.name}
                    </span>
                    <span className="text-slate-400 text-xs">{article.author.bio || "Staff Writer"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(article.publishedAt || article.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> {article.views} views
                  </span>
                </div>
              </div>
            </header>

            {/* Featured Cover Image */}
            {article.coverImage && (
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.coverImage} alt={article.title} className="w-full h-auto object-cover max-h-[550px]" />
              </div>
            )}

            {/* Content Body + Social Share */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-2">
              
              {/* Sticky Social Sharing Column */}
              <div className="md:col-span-1 md:sticky top-28 flex justify-center">
                <SocialShare title={article.title} url={articleUrl} />
              </div>

              {/* Article Markdown/HTML Body */}
              <div className="md:col-span-11 prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-6">
                {article.content.split("\n\n").map((paragraph: string, idx: number) => {
                  if (paragraph.startsWith("# ")) {
                    return <h1 key={idx} className="text-3xl font-extrabold text-slate-900 dark:text-white mt-10 mb-4 tracking-tight">{paragraph.replace("# ", "")}</h1>;
                  }
                  if (paragraph.startsWith("## ")) {
                    return <h2 key={idx} className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight">{paragraph.replace("## ", "")}</h2>;
                  }
                  if (paragraph.startsWith("### ")) {
                    return <h3 key={idx} className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-2 tracking-tight">{paragraph.replace("### ", "")}</h3>;
                  }
                  if (paragraph.startsWith("> ")) {
                    return (
                      <blockquote key={idx} className="border-l-4 border-[#2791F5] pl-5 italic text-slate-700 dark:text-slate-300 my-6 text-lg bg-blue-50/50 dark:bg-slate-900/50 py-3 pr-4 rounded-r-xl">
                        {paragraph.replace("> ", "")}
                      </blockquote>
                    );
                  }
                  return <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">{paragraph}</p>;
                })}
              </div>

            </div>

            {/* Article Photo Gallery Section */}
            {article.images && article.images.length > 0 && (
              <div className="space-y-6 pt-10 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2791F5] bg-blue-50 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-blue-100 dark:border-slate-800">
                    <ImageIcon className="w-4 h-4" /> Story Photo Gallery
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{article.images.length} High-Res Photos</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                  {article.images.map((img: any, index: number) => (
                    <div
                      key={img.id || index}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-[#2791F5]/40 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.caption || `${article.title} - Photo ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {img.caption && (
                        <div className="p-3 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                            {img.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Video Section (At Bottom) */}
            {youtubeEmbedUrl && (
              <div className="space-y-3 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  <PlayCircle className="w-4 h-4" /> Video Coverage
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Watch Story Report
                </h3>
                <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-black">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={article.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-200 dark:border-slate-800">
                <TagIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tags:</span>
                {article.tags.map(({ tag }: any) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`}>
                    <Badge variant="outline" className="hover:border-blue-500 hover:text-blue-500 transition-colors">
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Nested Comments Section */}
            <CommentSection articleId={article.id} initialComments={comments} />

          </div>

          {/* Right Sticky Sidebar Column: Trending News */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            <TrendingWidget articles={trendingArticles} />
          </aside>

        </div>

        {/* Related Articles Section (Full Width Bottom) */}
        {relatedArticles.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">Recommended Stories</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Related Articles</h2>
              </div>
              <Link href={`/category/${article.category.slug}`}>
                <span className="text-xs font-bold text-[#2791F5] hover:underline flex items-center gap-1">
                  View All in {article.category.name} →
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relArticle: any) => (
                <ArticleCard key={relArticle.id} article={relArticle} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
