import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { PlusCircle, ArrowLeft, Newspaper } from "lucide-react";
import { ArticlePublishToggle, ArticleFeaturedToggle, ArticleRowActions } from "@/components/admin/article-actions";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true, category: true },
  });

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="p-2 border-slate-200 text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Newspaper className="w-4 h-4 text-[#2791F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">Publishing Desk</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Article Management</h1>
            <p className="text-xs text-slate-500">Edit content, toggle Active/Inactive (Published/Draft), and delete stories</p>
          </div>
        </div>

        <Link href="/admin/articles/create" className="w-full sm:w-auto">
          <Button variant="primary" size="sm" className="gap-2 font-bold w-full sm:w-auto justify-center">
            <PlusCircle className="w-4 h-4" /> New Article
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Author</th>
              <th className="p-4 text-center">Active Status</th>
              <th className="p-4 text-center">Featured Hero</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-900 max-w-xs truncate">
                  {article.title}
                </td>
                <td className="p-4 text-slate-500">{article.category.name}</td>
                <td className="p-4 text-slate-500">{article.author.name}</td>
                
                {/* Active / Inactive Status Toggle */}
                <td className="p-4 text-center">
                  <ArticlePublishToggle articleId={article.id} published={article.published} />
                </td>

                {/* Featured Status Toggle */}
                <td className="p-4 text-center">
                  <ArticleFeaturedToggle articleId={article.id} featured={article.featured} />
                </td>

                <td className="p-4 text-slate-500">{formatDate(article.createdAt)}</td>
                
                {/* Icon-Only Action Buttons: Preview, Edit, Delete */}
                <td className="p-4 text-right">
                  <ArticleRowActions articleId={article.id} slug={article.slug} title={article.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

    </div>
  );
}
