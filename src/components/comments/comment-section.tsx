"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, CornerDownRight, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { addComment } from "@/actions/comments";
import { CommentWithAuthor } from "@/types";
import { useToast } from "@/components/ui/toast";
import { useLanguage } from "@/context/language-context";

interface CommentSectionProps {
  articleId: string;
  initialComments: CommentWithAuthor[];
}

export function CommentSection({ articleId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const toast = useToast();
  const { t } = useLanguage();

  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [mainContent, setMainContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostComment = async (parentId?: string) => {
    const text = parentId ? replyContent : mainContent;
    if (!text.trim()) return;

    setIsSubmitting(true);
    const res = await addComment(articleId, text, parentId);

    if (res.success && res.data) {
      toast.success(
        parentId
          ? t("Reply posted successfully!", "បានផ្ញើការឆ្លើយតបរួចរាល់!")
          : t("Comment posted successfully!", "បានផ្ញើមតិរួចរាល់!"),
        t("Comment Published", "បានចេញផ្សាយមតិ")
      );
      if (parentId) {
        setReplyContent("");
        setReplyingToId(null);
      } else {
        setMainContent("");
      }
      // Optimistic refresh
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to post comment", "Comment Error");
    }
    setIsSubmitting(false);
  };

  return (
    <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
      <div className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
        <MessageSquare className="w-5 h-5 text-[#2791F5]" />
        <h2>{t("Discussion & Comments", "ការពិភាក្សា & មតិយោបល់")} ({comments.length})</h2>
      </div>

      {/* Main Comment Box */}
      {session?.user ? (
        <div className="flex gap-4 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Avatar src={session.user.image} fallback={session.user.name || "U"} size="md" />
          <div className="flex-1 space-y-3">
            <textarea
              rows={3}
              placeholder={t("Join the discussion... Share your perspective.", "ចូលរួមការពិភាក្សា... ចែករំលែកមតិរបស់អ្នក។")}
              value={mainContent}
              onChange={(e) => setMainContent(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2791F5]/50"
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                className="gap-2 font-bold text-xs"
                onClick={() => handlePostComment()}
                disabled={isSubmitting || !mainContent.trim()}
              >
                <Send className="w-3.5 h-3.5" /> {t("Post Comment", "បញ្ជូនមតិ")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-2xl text-center space-y-3 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t("Sign in to join the conversation and leave a comment.", "សូមចូលគណនីដើម្បីចូលរួមបញ្ចេញមតិ។")}
          </p>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/login")}>
            {t("Sign In to Comment", "ចូលគណនីដើម្បីបញ្ចេញមតិ")}
          </Button>
        </div>
      )}

      {/* Comment Tree */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replyingToId={replyingToId}
            setReplyingToId={setReplyingToId}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onPostReply={(parentId) => handlePostComment(parentId)}
            isSubmitting={isSubmitting}
            sessionUser={session?.user}
          />
        ))}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  replyingToId,
  setReplyingToId,
  replyContent,
  setReplyContent,
  onPostReply,
  isSubmitting,
  sessionUser,
}: {
  comment: CommentWithAuthor;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (text: string) => void;
  onPostReply: (parentId: string) => void;
  isSubmitting: boolean;
  sessionUser: any;
}) {
  const { t } = useLanguage();
  const isReplying = replyingToId === comment.id;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <Avatar src={comment.author.image} fallback={comment.author.name || "U"} size="sm" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {comment.author.name}
            </span>
            <span className="text-[10px] text-slate-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {comment.content}
          </p>

          {sessionUser && (
            <button
              onClick={() => setReplyingToId(isReplying ? null : comment.id)}
              className="text-[11px] font-semibold text-[#2791F5] hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              <CornerDownRight className="w-3 h-3" /> {t("Reply", "ឆ្លើយតប")}
            </button>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <textarea
                rows={2}
                placeholder={`${t("Reply to", "ឆ្លើយតបទៅកាន់")} ${comment.author.name}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setReplyingToId(null)}>
                  {t("Cancel", "បោះបង់")}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onPostReply(comment.id)}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {t("Post Reply", "បញ្ជូនការឆ្លើយតប")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recursive Children */}
      {comment.children && comment.children.length > 0 && (
        <div className="pl-6 sm:pl-10 space-y-3 border-l-2 border-slate-100 dark:border-slate-800">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onPostReply={onPostReply}
              isSubmitting={isSubmitting}
              sessionUser={sessionUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
