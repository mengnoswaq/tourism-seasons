import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { ArticleWithRelations } from "@/types";
import { Clock, Eye, Sparkles } from "lucide-react";

interface HeroFeaturedProps {
  article: ArticleWithRelations;
}

export function HeroFeatured({ article }: HeroFeaturedProps) {
  const readingTime = calculateReadingTime(article.content);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl group border border-slate-200 bg-slate-900 text-white min-h-[460px] flex flex-col justify-end">
      {/* Background Image Overlay */}
      {article.coverImage && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-10 space-y-4 max-w-3xl">
        <div className="flex items-center gap-3">
          <Badge variant="brand" className="bg-[#2791F5] text-white border-none gap-1 py-1 font-bold">
            <Sparkles className="w-3 h-3" /> Featured Story
          </Badge>
          <span className="text-xs text-slate-300 font-medium">
            {article.category.name}
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-slate-300 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" /> {readingTime} min read
          </span>
        </div>

        <Link href={`/articles/${article.slug}`}>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight group-hover:text-[#2791F5] transition-colors leading-snug">
            {article.title}
          </h1>
        </Link>

        <p className="text-sm sm:text-base text-slate-300 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>

        <div className="flex items-center gap-4 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <Avatar src={article.author.image} fallback={article.author.name || "A"} size="sm" />
            <span className="font-semibold text-white">{article.author.name}</span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">{formatDate(article.publishedAt || article.createdAt)}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.views} views</span>
        </div>
      </div>
    </div>
  );
}
