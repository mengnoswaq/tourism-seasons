"use client";

import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useLanguage } from "@/context/language-context";

interface HeadlineItem {
  title: string;
  slug?: string;
}

interface TickerProps {
  headlines?: (string | HeadlineItem)[];
}

export function NewsTicker({ headlines: propHeadlines }: TickerProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<HeadlineItem[]>([]);

  useEffect(() => {
    setMounted(true);
    if (propHeadlines && propHeadlines.length > 0) {
      const formatted = propHeadlines.map((h) =>
        typeof h === "string" ? { title: h } : h
      );
      setItems(formatted);
    } else {
      fetch("/api/articles")
        .then((res) => res.json())
        .then((data) => {
          if (data.articles && data.articles.length > 0) {
            setItems(
              data.articles.map((a: any) => ({
                title: a.title,
                slug: a.slug,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [propHeadlines]);

  if (!mounted) return null;

  // Do not render Breaking News ticker on Profile page or Admin pages
  if (pathname === "/profile" || pathname?.startsWith("/admin")) {
    return null;
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-[#0b1329] text-white text-xs py-2 px-4 flex items-center gap-3 border-b border-slate-800/80 overflow-hidden select-none">
      <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-red-400 shrink-0 bg-red-950/70 border border-red-800/50 px-2.5 py-1 rounded-md text-[11px] shadow-sm">
        <Zap className="w-3.5 h-3.5 animate-pulse text-red-500 fill-red-500" />
        <span>{t("BREAKING", "ព័ត៌មានទាន់ហេតុការណ៍")}</span>
      </div>
      <div className="overflow-hidden relative w-full">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-slate-300 font-medium">
          {items.map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-2 hover:text-white transition-colors">
              <span className="text-slate-500 font-bold">›</span>
              {item.slug ? (
                <Link href={`/articles/${item.slug}`} className="hover:underline hover:text-blue-400">
                  {item.title}
                </Link>
              ) : (
                <span>{item.title}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
