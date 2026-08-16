"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";

interface FooterProps {
  siteSettings?: {
    siteName?: string;
    description?: string | null;
    logoUrl?: string | null;
  };
}

export function Footer({ siteSettings }: FooterProps = {}) {
  const { t } = useLanguage();
  const logo = siteSettings?.logoUrl || "/logo.png";
  const title = siteSettings?.siteName || "Tourism Seasons";
  const desc =
    siteSettings?.description ||
    "Discover top travel destinations, seasonal vacation recommendations, local culture, and tourism insights across the world.";

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-white p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <img
                  src={logo}
                  alt={title}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <span className="font-bold text-lg text-white group-hover:text-[#2791F5] transition-colors">
                {title.toUpperCase()}
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              {t(
                desc,
                "ស្វែងរកតំបន់ទេសចរណ៍កំពូលៗ អត្ថបទ និងការណែនាំអំពីការធ្វើដំណើរកម្សាន្តនៅគ្រប់រដូវកាល។"
              )}
            </p>
          </div>

          {/* Col 2: Categories / Sections */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t("Sections", "ប្រភេទព័ត៌មាន")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t("All News", "ព័ត៌មានទាំងអស់")}
                </Link>
              </li>
              <li>
                <Link href="/category/technology" className="hover:text-white transition-colors">
                  {t("Technology & AI", "បច្ចេកវិទ្យា & AI")}
                </Link>
              </li>
              <li>
                <Link href="/category/world" className="hover:text-white transition-colors">
                  {t("World News", "ព័ត៌មានពិភពលោក")}
                </Link>
              </li>
              <li>
                <Link href="/category/business" className="hover:text-white transition-colors">
                  {t("Business & Finance", "ពាណិជ្ជកម្ម & ហិរញ្ញវត្ថុ")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Editorial & Governance */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t("Editorial & Governance", "ស្តង់ដារ និងបទដ្ឋានព័ត៌មាន")}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("Editorial Standards", "ស្តង់ដារនៃការផ្សាយ")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("Ethics & Fact Checking", "ក្រមសីលធម៌ និងការផ្ទៀងផ្ទាត់ព័ត៌មាន")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("Careers & Internships", "ឱកាសការងារ")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("Press Room", "បន្ទប់សារព័ត៌មាន")}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Dispatch */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t("Newsletter Dispatch", "ជាវព័ត៌មានប្រចាំថ្ងៃ")}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {t(
                "Get our daily morning briefing directly in your inbox.",
                "ទទួល​បាន​ព័ត៌មាន​ទេសចរណ៍ និង​ការណែនាំ​ចុងក្រោយ​បំផុត។"
              )}
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder={t("Enter your work email", "បញ្ចូលអាសយដ្ឋានអ៊ីមែល...")}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2791F5]"
              />
              <button
                type="button"
                className="bg-[#2791F5] hover:bg-[#1b73c7] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                {t("Subscribe", "ជាវព័ត៌មាន")}
              </button>
            </form>
          </div>

        </div>

        {/* Footer Bottom copyright & links */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            {t(
              `© ${new Date().getFullYear()} Tourism Seasons. All rights reserved.`,
              `© ២០២៦ រដូវកាលទេសចរណ៍។ រក្សាសិទ្ធិគ្រប់យ៉ាង។`
            )}
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400">
              {t("Privacy Policy", "គោលការណ៍ឯកជនភាព")}
            </a>
            <a href="#" className="hover:text-slate-400">
              {t("Terms of Service", "លក្ខខណ្ឌប្រើប្រាស់")}
            </a>
            <a href="/sitemap.xml" className="hover:text-slate-400">
              {t("Sitemap", "ផែនទីគេហទំព័រ")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
