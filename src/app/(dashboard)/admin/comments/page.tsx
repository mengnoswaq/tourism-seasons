import React from "react";
import Link from "next/link";
import { getAllCommentsAdmin } from "@/actions/comments";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { CommentManager } from "@/components/admin/comment-manager";

export default async function AdminCommentsPage() {
  const comments = await getAllCommentsAdmin();

  const formattedComments = comments.map((c) => ({
    id: c.id,
    content: c.content,
    status: c.status,
    createdAt: c.createdAt,
    author: c.author,
    article: c.article,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="p-2 border-slate-200 text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-[#2791F5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2791F5]">
                Super Admin Comment Control
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Reader Comments Moderation Panel</h1>
            <p className="text-xs text-slate-500">
              Review, approve, reject or delete reader comments across all Cambodian tourism stories.
            </p>
          </div>
        </div>
      </div>

      <CommentManager initialComments={formattedComments} />
    </div>
  );
}
