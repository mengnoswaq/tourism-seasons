"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { MapPin, ChevronRight, Filter } from "lucide-react";
import { ArticleCard } from "@/components/news/article-card";
import { useLanguage } from "@/context/language-context";
import { getPublishedArticles } from "@/actions/articles";

interface ProvinceFilterSectionProps {
  provinces: any[];
  allArticles: any[];
}

export function ProvinceFilterSection({ provinces, allArticles }: ProvinceFilterSectionProps) {
  const { lang, t } = useLanguage();
  const isKhmer = lang === "kh";

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [filteredArticles, setFilteredArticles] = useState<any[]>(allArticles);
  const [isPending, startTransition] = useTransition();

  // Filter provinces that have articles or display all active provinces
  const displayProvinces = provinces || [];

  const handleSelectProvince = (slug: string | null) => {
    setSelectedSlug(slug);

    if (!slug) {
      setFilteredArticles(allArticles);
      return;
    }

    startTransition(async () => {
      // First try local filtering from loaded articles
      const localMatches = allArticles.filter((a) => a.province?.slug === slug);
      if (localMatches.length > 0) {
        setFilteredArticles(localMatches);
      } else {
        // Fetch from server if not found in initial articles
        const res = await getPublishedArticles({ provinceSlug: slug, limit: 6 });
        setFilteredArticles(res.articles || []);
      }
    });
  };

  const selectedProvinceObj = displayProvinces.find((p) => p.slug === selectedSlug);
  const selectedProvinceName = selectedProvinceObj
    ? (isKhmer && selectedProvinceObj.nameKhmer ? selectedProvinceObj.nameKhmer : selectedProvinceObj.name)
    : null;

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#2791F5] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight kh-title">
              {t("Filter by Province", "ព័ត៌មានតាមខេត្ត-ក្រុង")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("Explore news and travel guides from provinces across Cambodia", "ស្វែងរកព័ត៌មាននិងមគ្គុទ្ទេសក៍ទេសចរណ៍តាមបណ្តាខេត្ត")}
            </p>
          </div>
        </div>

        {selectedSlug && (
          <Link
            href={`/province/${selectedSlug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2791F5] hover:underline shrink-0"
          >
            {t("View All", "មើលទាំងអស់")} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Province Filter Buttons / Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* All Filter Button */}
        <button
          onClick={() => handleSelectProvince(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
            selectedSlug === null
              ? "bg-[#2791F5] text-white shadow-sm shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {t("All Provinces", "គ្រប់ខេត្ត-ក្រុង")}
        </button>

        {/* Province Pills */}
        {displayProvinces.map((prov) => {
          const provName = isKhmer && prov.nameKhmer ? prov.nameKhmer : prov.name;
          const isSelected = selectedSlug === prov.slug;
          const articleCount = prov._count?.articles ?? 0;

          return (
            <button
              key={prov.id}
              onClick={() => handleSelectProvince(prov.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-[#2791F5] text-white shadow-sm shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>📍 {provName}</span>
              {articleCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {articleCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Articles Grid for Selected Province */}
      <div className={isPending ? "opacity-50 transition-opacity" : "opacity-100 transition-opacity"}>
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredArticles.slice(0, 4).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {selectedProvinceName
                ? t(`No articles published in ${selectedProvinceName} yet.`, `មិនទាន់មានអត្ថបទសម្រាប់ ${selectedProvinceName} នៅឡើយទេ`)
                : t("No articles found for this province.", "មិនទាន់មានអត្ថបទសម្រាប់ខេត្តនេះនៅឡើយទេ")}
            </p>
            <p className="text-xs text-slate-400">
              {t("Try selecting another province above.", "សូមជ្រើសរើសខេត្តផ្សេងទៀតខាងលើ")}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
