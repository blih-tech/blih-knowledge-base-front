"use client";

import { useState } from "react";
import type { Initiative } from "@/lib/api/initiatives.api";
import { useInitiativeInteractions } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/StarRating";
import { Star, Send, Trash2, Loader2, MessageCircle } from "lucide-react";

const EMOJIS = ["👍", "👎", "💡", "🔥"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function InitiativeInteractions({ initiative, userId, isAdmin = false }: {
  initiative: Initiative; userId?: string; isAdmin?: boolean;
}) {
  const { rate, comment, removeComment, react } = useInitiativeInteractions();
  const [commentText, setCommentText] = useState("");

  if (initiative.status !== "submitted") return null;

  const myRating = initiative.ratings?.find((r) => r.user?._id === userId);

  const handleRate = (value: number) => {
    rate.mutate({ id: initiative._id, value });
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    comment.mutate({ id: initiative._id, text: commentText.trim() }, {
      onSuccess: () => setCommentText(""),
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    removeComment.mutate({ id: initiative._id, commentId });
  };

  const handleReact = (emoji: string) => {
    react.mutate({ id: initiative._id, emoji });
  };

  // Group reactions by emoji
  const reactionGroups = EMOJIS.map((emoji) => {
    const users = (initiative.reactions || []).filter((r) => r.emoji === emoji);
    const isMine = users.some((r) => r.user?._id === userId);
    return { emoji, count: users.length, isMine };
  });

  return (
    <Card className="overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-amber-500/50 to-orange-400/50" />
      <div className="p-5 space-y-5">
        {/* Reactions */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Reactions</h3>
          <div className="flex gap-2 flex-wrap">
            {reactionGroups.map(({ emoji, count, isMine }) => (
              <button key={emoji} type="button" onClick={() => handleReact(emoji)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all hover:scale-105 ${
                  isMine ? "bg-amber-50 border-amber-300 shadow-sm" : "bg-secondary/50 border-border hover:bg-secondary"
                }`}>
                <span className="text-base">{emoji}</span>
                {count > 0 && <span className="text-xs font-medium text-muted-foreground">{count}</span>}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Rating */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Rating</h3>
            {initiative.ratingsCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{initiative.averageRating}</span>
                <span>({initiative.ratingsCount} {initiative.ratingsCount === 1 ? "rating" : "ratings"})</span>
              </div>
            )}
          </div>
          <StarRating value={myRating?.value || 0} onChange={handleRate} />
        </div>

        <Separator />

        {/* Comments */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comments</h3>
            {initiative.commentsCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">{initiative.commentsCount}</Badge>
            )}
          </div>

          {/* Comment input */}
          <div className="flex gap-2 mb-4">
            <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleComment()} />
            <Button size="sm" className="gap-1" disabled={!commentText.trim() || comment.isPending} onClick={handleComment}>
              {comment.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Comment list */}
          {(initiative.comments || []).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...(initiative.comments || [])].reverse().map((c) => (
                <div key={c._id} className="flex gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {c.user?.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{c.user?.name}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5">{c.text}</p>
                  </div>
                  {(c.user?._id === userId || isAdmin) && (
                    <button type="button" onClick={() => handleDeleteComment(c._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
