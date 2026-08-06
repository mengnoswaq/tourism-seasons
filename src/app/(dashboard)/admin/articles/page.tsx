import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Trash2, ExternalLink, ArrowLeft, Newspaper, Sparkles, CheckCircle2, XCircle, Edit3 } from "lucide-react";
import { deleteArticle, toggleArticlePublishedStatus, toggleArticleFeaturedStatus } from "@/actions/articles";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true, category: true },
  });

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
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

        <Link href="/admin/articles/create">
          <Button variant="primary" size="sm" className="gap-2 font-bold">
            <PlusCircle className="w-4 h-4" /> New Article
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
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
                  <form action={async () => {
                    "use server";
                    await toggleArticlePublishedStatus(article.id);
                  }}>
                    <button type="submit" className="group cursor-pointer">
                      {article.published ? (
                        <Badge variant="success" className="gap-1 cursor-pointer hover:bg-emerald-100 transition-colors">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active (Published)
                        </Badge>
                      ) : (
                        <Badge variant="default" className="gap-1 cursor-pointer hover:bg-slate-200 transition-colors">
                          <XCircle className="w-3 h-3 text-slate-400" /> Inactive (Draft)
                        </Badge>
                      )}
                    </button>
                  </form>
                </td>

                {/* Featured Status Toggle */}
                <td className="p-4 text-center">
                  <form action={async () => {
                    "use server";
                    await toggleArticleFeaturedStatus(article.id);
                  }}>
                    <button type="submit" className="group cursor-pointer">
                      {article.featured ? (
                        <Badge variant="brand" className="gap-1 bg-[#2791F5] text-white border-none cursor-pointer">
                          <Sparkles className="w-3 h-3" /> Featured
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-slate-400 border-slate-200 cursor-pointer hover:border-[#2791F5]">
                          Regular
                        </Badge>
                      )}
                    </button>
                  </form>
                </td>

                <td className="p-4 text-slate-500">{formatDate(article.createdAt)}</td>
                
                {/* Icon-Only Action Buttons: Preview, Edit, Delete */}
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    
                    {/* Preview Icon Button */}
                    <Link href={`/articles/${article.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg text-slate-500 hover:text-[#2791F5] hover:bg-blue-50" title="Preview Story">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>

                    {/* Edit Article Icon Button */}
                    <Link href={`/admin/articles/${article.id}/edit`}>
                      <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-lg border-blue-200 text-[#2791F5] hover:bg-blue-50" title="Edit Article">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </Link>

                    {/* Delete Article Icon Button */}
                    <form action={async () => {
                      "use server";
                      await deleteArticle(article.id);
                    }} className="inline-block">
                      <Button variant="danger" size="sm" type="submit" className="w-8 h-8 p-0 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none" title="Delete Article">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
