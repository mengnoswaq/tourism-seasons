"use client";

import React, { useState } from "react";
import { TrendingUp, Eye, BarChart2, Calendar, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalyticsChartsProps {
  totalViews: number;
  totalArticles: number;
  categoryData: { id: string; name: string; count: number; percentage: number }[];
}

export function AnalyticsCharts({ totalViews, totalArticles, categoryData }: AnalyticsChartsProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "ytd">("7d");

  // Sample weekly data points for the trend SVG chart
  const weeklyData = [
    { day: "Mon", views: 240, readers: 180 },
    { day: "Tue", views: 380, readers: 290 },
    { day: "Wed", views: 510, readers: 410 },
    { day: "Thu", views: 720, readers: 580 },
    { day: "Fri", views: 640, readers: 490 },
    { day: "Sat", views: 890, readers: 710 },
    { day: "Sun", views: 1050, readers: 820 },
  ];

  const maxViews = Math.max(...weeklyData.map((d) => d.views));

  // Generate SVG path for smooth line chart
  const points = weeklyData.map((d, i) => {
    const x = (i / (weeklyData.length - 1)) * 500;
    const y = 160 - (d.views / maxViews) * 120;
    return `${x},${y}`;
  });

  const pathD = `M 0,160 L ${points.join(" L ")} L 500,160 Z`;
  const lineD = `M ${points.join(" L ")}`;

  return (
    <div className="space-y-8">
      
      {/* 1. Pageview & Traffic Growth Area Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#2791F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
                Audience Growth Trends
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">Traffic & Pageview Analytics</h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeframe("7d")}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeframe === "7d" ? "bg-[#2791F5] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeframe("30d")}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeframe === "30d" ? "bg-[#2791F5] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeframe("ytd")}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeframe === "ytd" ? "bg-[#2791F5] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              This Year
            </button>
          </div>
        </div>

        {/* SVG Curve Trend Area Chart */}
        <div className="space-y-4">
          <div className="relative h-48 w-full">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2791F5" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2791F5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="500" y2="160" stroke="#e2e8f0" strokeWidth="1" />

              {/* Filled Area */}
              <path d={pathD} fill="url(#blueGradient)" />

              {/* Stroke Line */}
              <path d={lineD} fill="none" stroke="#2791F5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data Points */}
              {weeklyData.map((d, i) => {
                const cx = (i / (weeklyData.length - 1)) * 500;
                const cy = 160 - (d.views / maxViews) * 120;
                return (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={cx} cy={cy} r="5" fill="#ffffff" stroke="#2791F5" strokeWidth="3" className="transition-transform group-hover:scale-150" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Day X-Axis Labels */}
          <div className="flex justify-between text-xs text-slate-400 font-semibold pt-2 border-t border-slate-100">
            {weeklyData.map((d, idx) => (
              <div key={idx} className="text-center">
                <span className="block text-slate-700 font-bold">{d.day}</span>
                <span className="text-[10px] text-[#2791F5] font-semibold">{d.views} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Desk Section Distribution Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#2791F5]" />
            <h3 className="text-lg font-bold text-slate-900">Desk Section Traffic Share</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{categoryData.length} Categories</span>
        </div>

        <div className="space-y-5">
          {categoryData.map((cat) => (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2791F5]" /> {cat.name}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="brand">{cat.count} stories</Badge>
                  <span className="font-black text-slate-900 text-xs">{cat.percentage}%</span>
                </div>
              </div>

              {/* Progress bar with #2791F5 animation */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#2791F5] to-blue-600 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.max(cat.percentage, 8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
