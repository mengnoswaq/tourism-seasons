import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { ArticleWithRelations } from "@/types";
import { Clock, Eye, MessageSquare } from "lucide-react";

interface ArticleCardProps {
  article: ArticleWithRelations;
  horizontal?: boolean;
}

export function ArticleCard({ article, horizontal = false }: ArticleCardProps) {
  const readingTime = calculateReadingTime(article.content);

  if (horizontal) {
    return (
      <article className="flex flex-col sm:flex-row gap-5 group bg-white rounded-2xl p-4 border border-slate-100 hover:border-[#2791F5]/40 hover:shadow-xl transition-all duration-300">
        {article.coverImage && (
          <Link href={`/articles/${article.slug}`} className="sm:w-48 h-40 shrink-0 rounded-xl overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        )}
        <div className="flex flex-col justify-between flex-1 space-y-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brand">{article.category.name}</Badge>
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {readingTime} min read
              </span>
            </div>
            <Link href={`/articles/${article.slug}`}>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#2791F5] transition-colors line-clamp-2">
                {article.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {article.summary}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Avatar src={article.author.image} fallback={article.author.name || "A"} size="sm" />
              <span className="font-medium text-slate-700">{article.author.name}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.views}</span>
              {article._count?.comments !== undefined && (
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {article._count.comments}</span>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:border-[#2791F5]/40 hover:shadow-xl transition-all duration-300">
      {article.coverImage && (
        <Link href={`/articles/${article.slug}`} className="h-48 w-full overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="brand" className="bg-white/95 backdrop-blur-sm shadow-sm font-bold">
              {article.category.name}
            </Badge>
          </div>
        </Link>
      )}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readingTime} min</span>
          </div>
          <Link href={`/articles/${article.slug}`}>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#2791F5] transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
            {article.summary}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <Avatar src={article.author.image} fallback={article.author.name || "A"} size="sm" />
            <span className="font-medium text-slate-700 text-xs">{article.author.name}</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Eye className="w-3.5 h-3.5" /> {article.views}
          </span>
        </div>
      </div>
    </article>
  );
}
