"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  ExternalLink,
} from "lucide-react";
import { toggleCommentStatusAdmin, deleteCommentAdmin } from "@/actions/comments";
import Link from "next/link";

export interface CommentAdminData {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  author: {
    id: string;
    name?: string | null;
    image?: string | null;
    email: string;
  };
  article: {
    id: string;
    title: string;
    slug: string;
  };
}

interface CommentManagerProps {
  initialComments: CommentAdminData[];
}

export function CommentManager({ initialComments }: CommentManagerProps) {
  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [comments, setComments] = useState<CommentAdminData[]>(initialComments);
  const [search, setSearch] = useState("");

  const handleToggleStatus = (id: string, currentStatus: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: currentStatus === "APPROVED" ? "REJECTED" : "APPROVED" } : c))
    );

    startTransition(async () => {
      const res = await toggleCommentStatusAdmin(id);
      if (res.success) {
        const nextStatus = currentStatus === "APPROVED" ? "Rejected" : "Approved";
        toast.success(`Comment status updated to ${nextStatus}`, "Moderated");
        router.refresh();
      } else {
        setComments(initialComments);
        toast.error(res.error || "Failed to update comment status.", "Error");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this reader comment?")) return;

    setComments((prev) => prev.filter((c) => c.id !== id));

    startTransition(async () => {
      const res = await deleteCommentAdmin(id);
      if (res.success) {
        toast.success("Reader comment deleted.", "Deleted");
        router.refresh();
      } else {
        setComments(initialComments);
        toast.error(res.error || "Failed to delete comment.", "Error");
      }
    });
  };

  const filtered = comments.filter(
    (c) =>
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      (c.author.name && c.author.name.toLowerCase().includes(search.toLowerCase())) ||
      c.article.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#2791F5]" /> Reader Comments Moderation ({comments.length})
          </h2>
          <p className="text-xs text-slate-500">Approve, reject or moderate reader comments across all Cambodian articles.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comment or author..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3">Author</th>
              <th className="p-3">Comment Text</th>
              <th className="p-3">Article Story</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">No reader comments found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const isApproved = c.status === "APPROVED";
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={c.author.image} fallback={c.author.name || "U"} size="sm" />
                        <div>
                          <span className="font-bold text-slate-900 block">{c.author.name || "Anonymous"}</span>
                          <span className="text-[10px] text-slate-400">{c.author.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 max-w-xs font-medium text-slate-800 leading-relaxed">
                      &quot;{c.content}&quot;
                    </td>

                    <td className="p-3">
                      <Link
                        href={`/articles/${c.article.slug}`}
                        target="_blank"
                        className="font-bold text-[#2791F5] hover:underline flex items-center gap-1 max-w-[200px] truncate"
                        title={c.article.title}
                      >
                        {c.article.title} <ExternalLink className="w-3 h-3 shrink-0" />
                      </Link>
                    </td>

                    <td className="p-3 text-slate-400 font-medium">
                      {formatDate(c.createdAt)}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        disabled={isPending}
                        className="cursor-pointer"
                      >
                        {isApproved ? (
                          <Badge variant="success" className="gap-1 cursor-pointer">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Approved
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="gap-1 cursor-pointer bg-red-50 text-red-600 border-red-200">
                            <XCircle className="w-3 h-3 text-red-500" /> Rejected
                          </Badge>
                        )}
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handleToggleStatus(c.id, c.status)}
                          disabled={isPending}
                          className="text-xs"
                        >
                          {isApproved ? "Reject" : "Approve"}
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          disabled={isPending}
                          className="w-8 h-8 p-0 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
