"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { ArticleWithRelations } from "@/types";
import { Clock, Eye, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface HeroFeaturedProps {
  article: ArticleWithRelations;
}

export function HeroFeatured({ article }: HeroFeaturedProps) {
  const { lang, t } = useLanguage();
  const readingTime = calculateReadingTime(article.content);

  const isKhmer = lang === "kh";
  const displayTitle = (isKhmer && article.titleKhmer) ? article.titleKhmer : article.title;
  const displaySummary = (isKhmer && article.summaryKhmer) ? article.summaryKhmer : article.summary;
  const displayCategory = (isKhmer && article.category.nameKhmer) ? article.category.nameKhmer : article.category.name;
  const displayProvince = article.province ? ((isKhmer && article.province.nameKhmer) ? article.province.nameKhmer : article.province.name) : null;

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl group border border-slate-200 bg-slate-900 text-white min-h-[460px] flex flex-col justify-end">
      {/* Background Image Overlay */}
      {article.coverImage && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-10 space-y-4 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="brand" className="bg-[#2791F5] text-white border-none gap-1 py-1 font-bold">
            <Sparkles className="w-3 h-3" /> {t("Featured Story", "អត្ថបទពិសេស")}
          </Badge>
          {displayProvince && (
            <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white border-0 font-medium">
              📍 {displayProvince}
            </Badge>
          )}
          <span className="text-xs text-slate-300 font-medium">
            {displayCategory}
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-slate-300 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" /> {readingTime} {t("min read", "នាទីអាន")}
          </span>
        </div>

        <Link href={`/articles/${article.slug}`}>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-normal group-hover:text-[#2791F5] transition-colors leading-relaxed sm:leading-[1.55] kh-title">
            {displayTitle}
          </h1>
        </Link>

        <p className="text-sm sm:text-base text-slate-300 line-clamp-2 leading-relaxed">
          {displaySummary}
        </p>

        <div className="flex items-center gap-4 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <Avatar src={article.author.image} fallback={article.author.name || "A"} size="sm" />
            <span className="font-semibold text-white">{article.author.name}</span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">{formatDate(article.publishedAt || article.createdAt)}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {article.views} {t("views", "ទស្សនា")}
          </span>
        </div>
      </div>
    </div>
  );
}
