"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { MapPin, ChevronRight, Filter, Compass } from "lucide-react";
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

  const displayProvinces = provinces || [];

  const handleSelectProvince = (slug: string | null) => {
    setSelectedSlug(slug);

    if (!slug) {
      setFilteredArticles(allArticles);
      return;
    }

    startTransition(async () => {
      // First check local articles matching province slug
      const localMatches = allArticles.filter((a) => a.province?.slug === slug);
      if (localMatches.length > 0) {
        setFilteredArticles(localMatches);
      } else {
        // Query server for articles matching this province
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
    <section className="space-y-8 pt-8 border-t border-slate-200/80 dark:border-slate-800">
      
      {/* Container Banner with Modern Styling */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Decorative Background Accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2791F5]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Title & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Compass className="w-3.5 h-3.5 text-[#2791F5]" />
                {t("Kingdom of Wonder", "ព្រះរាជាណាចក្រអច្ឆរិយៈ")}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white kh-title">
                {t("Explore Cambodia by Province", "ស្វែងរកព័ត៌មានតាមបណ្តាខេត្ត-ក្រុង")}
              </h2>
            </div>

            <p className="text-xs text-slate-300 font-medium max-w-xs">
              {t("Filter stories, travel guides and seasonal updates from 25 provinces across Cambodia.", "ជ្រើសរើសខេត្តខាងក្រោមដើម្បីមើលព័ត៌មាននិងមគ្គុទ្ទេសក៍ទេសចរណ៍")}
            </p>
          </div>

          {/* Filter By Province Label */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wide">
            <MapPin className="w-4 h-4 text-[#2791F5]" />
            {t("Filter by province:", "ជ្រើសរើសខេត្ត:")}
          </div>

          {/* Province Filter Pills Grid */}
          <div className="flex flex-wrap items-center gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {/* See All Button */}
            <button
              onClick={() => handleSelectProvince(null)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-md ${
                selectedSlug === null
                  ? "bg-[#2791F5] text-white ring-2 ring-blue-400/50 scale-105"
                  : "bg-white/15 text-white hover:bg-white/25 border border-white/10"
              }`}
            >
              <span>📍 {t("See All", "មើលទាំងអស់")}</span>
            </button>

            {/* Province Buttons */}
            {displayProvinces.map((prov) => {
              const provName = isKhmer && prov.nameKhmer ? prov.nameKhmer : prov.name;
              const isSelected = selectedSlug === prov.slug;
              const articleCount = prov._count?.articles ?? 0;

              return (
                <button
                  key={prov.id}
                  onClick={() => handleSelectProvince(prov.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isSelected
                      ? "bg-[#2791F5] text-white ring-2 ring-blue-400/50 scale-105 shadow-blue-500/30"
                      : "bg-white/90 text-slate-800 hover:bg-white hover:scale-102 hover:shadow-md"
                  }`}
                >
                  <span>{provName}</span>
                  {articleCount > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isSelected ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {articleCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Display Area */}
      <div className={isPending ? "opacity-40 transition-opacity" : "opacity-100 transition-opacity"}>
        
        {/* If 'See All' (no province selected), show interactive Province Cards Grid */}
        {selectedSlug === null ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t("Featured Provinces", "ខេត្តលេចធ្លោ")}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {displayProvinces.length} {t("Provinces Available", "ខេត្ត-ក្រុង")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {displayProvinces.slice(0, 4).map((prov) => {
                const provName = isKhmer && prov.nameKhmer ? prov.nameKhmer : prov.name;
                // Find cover image from province object or match from loaded articles
                const matchingArticle = allArticles.find((a) => a.province?.slug === prov.slug);
                const coverImage = prov.image || matchingArticle?.coverImage || "/placeholder-province.jpg";

                return (
                  <div
                    key={prov.id}
                    onClick={() => handleSelectProvince(prov.slug)}
                    className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer h-48 border border-slate-200/80 dark:border-slate-800"
                  >
                    {/* Background Cover Image with Hover Zoom */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt={provName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Dark Gradient Overlay for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:from-black/90 transition-colors duration-300" />

                    {/* Floating White Overlay Badge (Custom Style inspired by reference image) */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <div className="px-4 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-white/20 text-slate-900 dark:text-white text-xs font-black uppercase tracking-wider group-hover:bg-[#2791F5] group-hover:text-white transition-all duration-300">
                        {provName}
                      </div>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {prov._count?.articles || 0} {t("Stories Published", "អត្ថបទ")}
                      </span>
                      <span className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-[#2791F5] flex items-center justify-center text-white transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* If a specific province is selected, show its article cards */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                📍 {selectedProvinceName}
              </h3>
              <button
                onClick={() => handleSelectProvince(null)}
                className="text-xs font-bold text-[#2791F5] hover:underline cursor-pointer"
              >
                {t("← Clear Filter", "← លុបការចម្រោះ")}
              </button>
            </div>

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
                  {t(`No articles published in ${selectedProvinceName} yet.`, `មិនទាន់មានអត្ថបទសម្រាប់ ${selectedProvinceName} នៅឡើយទេ`)}
                </p>
                <p className="text-xs text-slate-400">
                  {t("Select another province from the list above.", "សូមជ្រើសរើសខេត្តផ្សេងទៀតខាងលើ")}
                </p>
              </div>
            )}
          </div>
        )}

      </div>

    </section>
  );
}
