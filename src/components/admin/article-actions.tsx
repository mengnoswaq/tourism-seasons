"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Trash2, ExternalLink, Edit3, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { deleteArticle, toggleArticlePublishedStatus, toggleArticleFeaturedStatus } from "@/actions/articles";

export function ArticlePublishToggle({ articleId, published }: { articleId: string; published: boolean }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleArticlePublishedStatus(articleId);
      if (res.success) {
        toast.success(res.message || "Article status updated!", "Status Updated");
      } else {
        toast.error(res.error || "Failed to update status", "Update Failed");
      }
    });
  };

  return (
    <button onClick={handleToggle} disabled={isPending} type="button" className="group cursor-pointer">
      {published ? (
        <Badge variant="success" className="gap-1 cursor-pointer hover:bg-emerald-100 transition-colors">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active (Published)
        </Badge>
      ) : (
        <Badge variant="default" className="gap-1 cursor-pointer hover:bg-slate-200 transition-colors">
          <XCircle className="w-3 h-3 text-slate-400" /> Inactive (Draft)
        </Badge>
      )}
    </button>
  );
}

export function ArticleFeaturedToggle({ articleId, featured }: { articleId: string; featured: boolean }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleArticleFeaturedStatus(articleId);
      if (res.success) {
        toast.success(res.message || "Featured status updated!", "Featured Updated");
      } else {
        toast.error(res.error || "Failed to update status", "Update Failed");
      }
    });
  };

  return (
    <button onClick={handleToggle} disabled={isPending} type="button" className="group cursor-pointer">
      {featured ? (
        <Badge variant="brand" className="gap-1 bg-[#2791F5] text-white border-none cursor-pointer">
          <Sparkles className="w-3 h-3" /> Featured
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1 text-slate-400 border-slate-200 cursor-pointer hover:border-[#2791F5]">
          Regular
        </Badge>
      )}
    </button>
  );
}

export function ArticleRowActions({ articleId, slug, title }: { articleId: string; slug: string; title: string }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    startTransition(async () => {
      const res = await deleteArticle(articleId);
      if (res.success) {
        toast.success(`Article "${title}" deleted successfully!`, "Article Deleted");
      } else {
        toast.error(res.error || "Failed to delete article", "Delete Failed");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link href={`/articles/${slug}`} target="_blank">
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg text-slate-500 hover:text-[#2791F5] hover:bg-blue-50" title="Preview Story">
          <ExternalLink className="w-4 h-4" />
        </Button>
      </Link>

      <Link href={`/admin/articles/${articleId}/edit`}>
        <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-lg border-blue-200 text-[#2791F5] hover:bg-blue-50" title="Edit Article">
          <Edit3 className="w-4 h-4" />
        </Button>
      </Link>

      <Button
        variant="danger"
        size="sm"
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="w-8 h-8 p-0 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none disabled:opacity-50"
        title="Delete Article"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
