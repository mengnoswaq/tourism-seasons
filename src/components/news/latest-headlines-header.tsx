"use client";

import React from "react";
import { Newspaper } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export function LatestHeadlinesHeader() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
        <Newspaper className="w-5 h-5 text-[#2791F5]" />
        {t("Latest Headlines", "ព័ត៌មានចុងក្រោយ")}
      </h2>
      <span className="text-xs text-slate-400 font-semibold uppercase">
        {t("Updated Real-Time", "ធ្វើបច្ចុប្បន្នភាពរាល់ពេល")}
      </span>
    </div>
  );
}
