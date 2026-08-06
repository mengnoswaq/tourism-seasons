import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { BarChart3, TrendingUp, Eye, Newspaper, Users, MessageSquare, Flame } from "lucide-react";

export default async function AnalyticsPage() {
  const [totalArticles, viewStats, categories, topArticles, commentCount, userCount] = await Promise.all([
    prisma.article.count({ where: { published: true } }),
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.category.findMany({
      include: {
        _count: { select: { articles: true } },
      },
    }),
    prisma.article.findMany({
      take: 10,
      orderBy: { views: "desc" },
      include: { author: true, category: true },
    }),
    prisma.comment.count(),
    prisma.user.count(),
  ]);

  const totalViews = viewStats._sum.views || 0;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#2791F5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
              Real-Time Traffic & Engagement
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics & Content Performance</h1>
          <p className="text-xs text-slate-500 mt-1">Deep-dive audience insights, top performing stories, and section metrics</p>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Impressions</CardTitle>
            <Eye className="w-5 h-5 text-[#2791F5]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{totalViews.toLocaleString()}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18.4% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Published Stories</CardTitle>
            <Newspaper className="w-5 h-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{totalArticles}</div>
            <p className="text-[11px] text-slate-500 mt-1">Indexed in Google News & Sitemap</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reader Comments</CardTitle>
            <MessageSquare className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{commentCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Nested Thread Interactions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Readers</CardTitle>
            <Users className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{userCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">Subscribers & Staff Accounts</p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Top 10 Most Popular Articles */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Most Read Articles
            </h2>
            <span className="text-xs font-semibold text-slate-400">Ranked by Views</span>
          </div>

          <div className="space-y-4">
            {topArticles.map((article, idx) => (
              <div key={article.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-[#2791F5] w-6 text-center">0{idx + 1}</span>
                  <div>
                    <Link href={`/articles/${article.slug}`} target="_blank">
                      <h3 className="text-xs font-bold text-slate-900 hover:text-[#2791F5] transition-colors line-clamp-1">
                        {article.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <Badge variant="brand">{article.category.name}</Badge>
                      <span>•</span>
                      <span>{article.author.name}</span>
                      <span>•</span>
                      <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-slate-900 flex items-center gap-1 justify-end">
                    <Eye className="w-3.5 h-3.5 text-[#2791F5]" /> {article.views.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">Total Views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Desk Section Distribution
          </h2>

          <div className="space-y-4">
            {categories.map((cat) => {
              const count = cat._count.articles;
              const percentage = totalArticles > 0 ? Math.round((count / totalArticles) * 100) : 0;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800">{cat.name}</span>
                    <span className="text-slate-500 font-semibold">{count} stories ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2791F5] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
