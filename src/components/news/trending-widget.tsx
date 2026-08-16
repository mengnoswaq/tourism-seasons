"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Eye } from "lucide-react";
import { ArticleWithRelations } from "@/types";
import { useLanguage } from "@/context/language-context";

interface TrendingWidgetProps {
  articles: ArticleWithRelations[];
}

export function TrendingWidget({ articles }: TrendingWidgetProps) {
  const { lang, t } = useLanguage();
  const isKhmer = lang === "kh";

  return (
    <div className="bg-white rounded-3xl border border-slate-100/90 p-7 space-y-6 shadow-sm">
      <div className="flex items-center gap-2.5 font-bold text-slate-900 border-b border-slate-100/90 pb-4">
        <TrendingUp className="w-5 h-5 text-[#2791F5]" />
        <h3 className="text-lg font-black tracking-tight text-slate-900">
          {t("Trending", "កំពុងពេញនិយម")}
        </h3>
      </div>

      <div className="space-y-6">
        {articles.slice(0, 5).map((article, idx) => {
          const displayTitle = (isKhmer && article.titleKhmer) ? article.titleKhmer : article.title;
          const displayCategory = (isKhmer && article.category.nameKhmer) ? article.category.nameKhmer : article.category.name;

          return (
            <div key={article.id} className="flex gap-4 items-start group">
              <span className="text-2xl font-black text-slate-300 group-hover:text-[#2791F5] transition-colors w-8 shrink-0 pt-0.5">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="space-y-1.5 flex-1">
                <Link href={`/articles/${article.slug}`}>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#2791F5] transition-colors line-clamp-2 leading-relaxed kh-title">
                    {displayTitle}
                  </h4>
                </Link>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span>{displayCategory}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" /> {article.views}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
