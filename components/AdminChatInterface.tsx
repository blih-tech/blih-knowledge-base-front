"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, Source } from "@/lib/api/ai.api";
import { useAiChat } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Send,
  FileText,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  User,
  Bot,
  Users,
  BookOpen,
  Copy,
  Check,
  Search,
  ScrollText,
  BarChart3,
  Lightbulb,
} from "lucide-react";

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-violet-100/60 text-violet-800 px-1 py-0.5 rounded text-[12px] font-mono">$1</code>'
    )
    .replace(
      /^[-•]\s+(.+)$/gm,
      '<li class="ml-4 list-disc text-[13px] leading-relaxed py-0.5">$1</li>'
    )
    .replace(
      /^\d+\.\s+(.+)$/gm,
      '<li class="ml-4 list-decimal text-[13px] leading-relaxed py-0.5">$1</li>'
    )
    .replace(
      /^#{1,3}\s+(.+)$/gm,
      '<p class="font-semibold text-foreground mt-3 mb-1 text-[13px]">$1</p>'
    )
    .replace(/\n/g, "<br/>");
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="opacity-0 group-hover/msg:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-violet-50 text-muted-foreground hover:text-violet-600"
      title="Copy message"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-500" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </button>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center shrink-0 ring-1 ring-violet-200/60">
        <Bot className="w-4 h-4 text-violet-600" />
      </div>
      <div className="bg-white border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-violet-400/50 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.8s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceCards({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.map((src) => (
        <a
          key={src.slug}
          href={`/documents/${src.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] bg-white text-violet-700 border border-violet-200/80 rounded-lg px-2.5 py-1.5 hover:bg-violet-50 hover:border-violet-300 transition-all shadow-sm"
        >
          <FileText className="w-3 h-3 text-violet-400" />
          <span className="max-w-[160px] truncate">{src.title}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-40" />
        </a>
      ))}
    </div>
  );
}

function MessageBubble({
  msg,
  sources,
}: {
  msg: ChatMessage;
  sources?: Source[];
}) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`group/msg flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser
            ? "bg-gradient-to-br from-violet-600 to-violet-500 text-white shadow-sm shadow-violet-500/20"
            : "bg-gradient-to-br from-violet-100 to-violet-50 ring-1 ring-violet-200/60"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-violet-600" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col`}
      >
        <div
          className={`px-4 py-3 text-[13px] leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-violet-600 to-violet-500 text-white rounded-2xl rounded-tr-sm shadow-sm shadow-violet-500/15"
              : "bg-white border border-border/60 text-foreground rounded-2xl rounded-tl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{msg.content}</span>
          ) : (
            <div
              className="prose-chat [&_li]:py-0.5 [&_strong]:text-foreground [&_br+br]:hidden"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          )}
        </div>
        {/* Copy + sources for assistant */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            <CopyButton text={msg.content} />
          </div>
        )}
        {!isUser && sources && <SourceCards sources={sources} />}
      </div>
    </div>
  );
}

// ─── Suggestion categories ────────────────────────────────────────────────────

const SUGGESTION_GROUPS = [
  {
    label: "Knowledge Base",
    icon: BookOpen,
    color: "text-blue-600 bg-blue-50",
    items: [
      "What are the company's core HR procedures?",
      "List all documents under the Procedures category",
    ],
  },
  {
    label: "Client Intelligence",
    icon: Users,
    color: "text-violet-600 bg-violet-50",
    items: [
      "Summarise all client profiles and their key preferences",
      "Which clients have negative observations?",
    ],
  },
  {
    label: "Reports & Policies",
    icon: BarChart3,
    color: "text-emerald-600 bg-emerald-50",
    items: [
      "Summarise the promotion and transfer policy",
      "Show me this week's report summaries",
    ],
  },
];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-6">
      {/* Animated icon */}
      <div className="relative mb-5">
        <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-violet-400/15 blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200/60 flex items-center justify-center shadow-sm">
          <Sparkles className="w-7 h-7 text-violet-600" />
        </div>
      </div>

      <h2 className="text-base font-bold text-foreground mb-1 tracking-tight">
        Internal AI Assistant
      </h2>
      <p className="text-xs text-muted-foreground mb-1 max-w-[260px] leading-relaxed">
        Full access to documents, FAQs, client profiles, observations, and
        reports.
      </p>

      {/* Scope badges */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 mb-5">
        <span className="flex items-center gap-1 bg-secondary/80 px-2 py-0.5 rounded-full">
          <BookOpen className="w-2.5 h-2.5" /> Docs
        </span>
        <span className="flex items-center gap-1 bg-secondary/80 px-2 py-0.5 rounded-full">
          <Users className="w-2.5 h-2.5" /> Clients
        </span>
        <span className="flex items-center gap-1 bg-secondary/80 px-2 py-0.5 rounded-full">
          <ScrollText className="w-2.5 h-2.5" /> Policies
        </span>
        <span className="flex items-center gap-1 bg-secondary/80 px-2 py-0.5 rounded-full">
          <BarChart3 className="w-2.5 h-2.5" /> Reports
        </span>
      </div>

      {/* Suggestion groups */}
      <div className="w-full max-w-sm space-y-3">
        {SUGGESTION_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <div className={`p-1 rounded-md ${group.color}`}>
                <group.icon className="w-3 h-3" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {group.label}
              </span>
            </div>
            <div className="space-y-1">
              {group.items.map((s) => (
                <button
                  key={s}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border/80 bg-white hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-700 transition-all text-muted-foreground shadow-sm"
                  onClick={() => {
                    const event = new CustomEvent("admin-ai-suggestion", {
                      detail: s,
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground/40 mt-5">
        Powered by Gemini · Scoped to your permissions
      </p>
    </div>
  );
}

// ─── Main admin chat interface ────────────────────────────────────────────────

export function AdminChatInterface({
  initialMessage = "",
}: {
  initialMessage?: string;
}) {
  const {
    messages,
    sourcesMap,
    isStreaming,
    error,
    send: sendMessage,
    reset: resetChat,
  } = useAiChat();
  const [input, setInput] = useState("");
  const sentInitial = useRef(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      void sendMessage(trimmed);
    },
    [isStreaming, sendMessage]
  );

  // Auto-send the prefilled message once on mount
  useEffect(() => {
    if (initialMessage && !sentInitial.current) {
      sentInitial.current = true;
      send(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    const handler = (e: Event) => {
      setInput((e as CustomEvent<string>).detail);
      textareaRef.current?.focus();
    };
    window.addEventListener("admin-ai-suggestion", handler);
    return () => window.removeEventListener("admin-ai-suggestion", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const reset = () => {
    resetChat();
    setInput("");
  };

  const messageCount = messages.filter((m) => m.role === "user").length;
  const lastMsg = messages[messages.length - 1];
  const awaitingFirstToken =
    isStreaming &&
    (!lastMsg || lastMsg.role !== "assistant" || lastMsg.content === "");

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 shrink-0 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 ring-1 ring-violet-200/40">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-tight">
              AI Assistant
            </span>
            <span className="text-[10px] text-violet-600/70 font-medium leading-tight">
              Admin · Full Access
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {messageCount > 0 && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {messageCount} {messageCount === 1 ? "msg" : "msgs"}
            </span>
          )}
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="gap-1 text-muted-foreground h-7 text-xs px-2"
            >
              <RotateCcw className="w-3 h-3" />
              New
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((msg, idx) => {
              if (
                msg.role === "assistant" &&
                msg.content === "" &&
                idx === messages.length - 1
              )
                return null;
              return (
                <MessageBubble
                  key={idx}
                  msg={msg}
                  sources={
                    msg.role === "assistant" ? sourcesMap[idx] : undefined
                  }
                />
              );
            })
          )}
          {awaitingFirstToken && <TypingIndicator />}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50/80 border border-red-200/60 rounded-xl px-4 py-3 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs mb-0.5">
                  Something went wrong
                </p>
                <p className="text-xs text-red-500">{error}</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-3 pt-2 border-t border-border/60 shrink-0 bg-white/60 backdrop-blur-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-2 items-end bg-white rounded-xl border border-border shadow-sm px-3 py-2 focus-within:border-violet-400/50 focus-within:ring-2 focus-within:ring-violet-400/10 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about clients, documents, policies…"
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50 min-h-[28px] max-h-[160px] py-1.5 leading-relaxed"
            />
            <button
              disabled={!input.trim() || isStreaming}
              onClick={() => send(input)}
              className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm shadow-violet-500/20 disabled:shadow-none"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
            ↵ Send · ⇧↵ New line · Scoped to your role and permissions
          </p>
        </div>
      </div>
    </div>
  );
}
