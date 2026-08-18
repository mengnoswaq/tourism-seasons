"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SocialShare } from "@/components/news/social-share";
import { CommentSection } from "@/components/comments/comment-section";
import { ArticleCard } from "@/components/news/article-card";
import { TrendingWidget } from "@/components/news/trending-widget";
import { formatDate, calculateReadingTime, getYouTubeEmbedUrl } from "@/lib/utils";
import { Clock, Eye, Calendar, Tag as TagIcon, PlayCircle, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface ArticleDetailViewProps {
  article: any;
  comments: any[];
  relatedArticles: any[];
  trendingArticles: any[];
}

export function ArticleDetailView({
  article,
  comments,
  relatedArticles,
  trendingArticles,
}: ArticleDetailViewProps) {
  const { lang, t } = useLanguage();
  const isKhmer = lang === "kh";

  const displayTitle = (isKhmer && article.titleKhmer) ? article.titleKhmer : article.title;
  const displaySummary = (isKhmer && article.summaryKhmer) ? article.summaryKhmer : article.summary;
  const displayContent = (isKhmer && article.contentKhmer) ? article.contentKhmer : article.content;
  const displayCategory = (isKhmer && article.category.nameKhmer) ? article.category.nameKhmer : article.category.name;
  const displayProvince = article.province ? ((isKhmer && article.province.nameKhmer) ? article.province.nameKhmer : article.province.name) : null;

  const readingTime = calculateReadingTime(displayContent);
  const articleUrl = typeof window !== "undefined" ? window.location.href : "";
  const youtubeEmbedUrl = getYouTubeEmbedUrl(article.youtubeUrl);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      {/* Main Article Content Area */}
      <div className="lg:col-span-8 space-y-10">
        
        {/* Article Header */}
        <header className="space-y-6 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <Link href={`/category/${article.category.slug}`}>
              <Badge variant="brand" className="text-xs px-3.5 py-1 font-semibold rounded-full bg-blue-50 text-[#2791F5] hover:bg-blue-100 border border-blue-200/50">
                {displayCategory}
              </Badge>
            </Link>
            <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {readingTime} {t("min read", "នាទីអាន")}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-normal leading-[1.65] kh-title">
            {displayTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            {displaySummary}
          </p>

          {/* Meta Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-b border-slate-200/80 dark:border-slate-800 py-4 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <Avatar src={article.author.image} fallback={article.author.name || "A"} size="md" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {article.author.name}
              </span>
            </div>

            <div className="flex items-center gap-5 text-slate-400 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(article.publishedAt || article.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> {article.views} {t("views", "ទស្សនា")}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {article.coverImage && (
          <div className="max-w-[600px] mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.coverImage} alt={displayTitle} className="w-full h-auto object-contain block" />
          </div>
        )}

        {/* Content Body + Social Share */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-2">
          
          {/* Sticky Social Sharing Column */}
          <div className="md:col-span-1 md:sticky top-28 flex justify-center">
            <SocialShare title={displayTitle} url={articleUrl} />
          </div>

          {/* Article Body */}
          <div className="md:col-span-11 prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-6">
            {displayContent.split("\n\n").map((paragraph: string, idx: number) => {
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

        {/* Photo Gallery Section */}
        {article.images && article.images.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2791F5] bg-blue-50 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-blue-100 dark:border-slate-800">
                <ImageIcon className="w-4 h-4" /> {t("Story Photo Gallery", "រូបភាពក្នុងអត្ថបទ")}
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {article.images.length} {t("High-Res Photos", "រូបភាពច្បាស់")}
              </span>
            </div>
            
            <div className="flex flex-col gap-6 w-full">
              {article.images.map((img: any, index: number) => {
                const imgCaption = (isKhmer && img.captionKhmer) ? img.captionKhmer : img.caption;
                return (
                  <div
                    key={img.id || index}
                    className="max-w-[600px] w-full mx-auto group relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-[#2791F5]/40 transition-all duration-300 flex flex-col"
                  >
                    <div className="w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={imgCaption || `${displayTitle} - Photo ${index + 1}`}
                        className="w-full h-auto object-contain block group-hover:scale-[1.01] transition-transform duration-300"
                      />
                    </div>
                    {imgCaption && (
                      <div className="p-4 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {imgCaption}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* YouTube Video Section */}
        {youtubeEmbedUrl && (
          <div className="space-y-3 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <PlayCircle className="w-4 h-4" /> {t("Video Coverage", "វីដេអូរាយការណ៍")}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {t("Watch Story Report", "ទស្សនាវីដេអូ")}
            </h3>
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-black">
              <iframe
                src={youtubeEmbedUrl}
                title={displayTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Location / Province */}
        {article.province && (
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              📍 {t("PROVINCE / LOCATION:", "ខេត្ត / ទីតាំង:")}
            </span>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/60 font-semibold px-3 py-1 text-xs">
              📍 {displayProvince}
            </Badge>
          </div>
        )}

        {/* Comments */}
        <CommentSection articleId={article.id} initialComments={comments} />

      </div>

      {/* Right Sidebar: Trending */}
      <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
        <TrendingWidget articles={trendingArticles} />
      </aside>

    </div>
  );
}
