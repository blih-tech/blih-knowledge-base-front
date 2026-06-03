"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ChatMessage, Source } from "@/lib/api/ai.api";
import { getFullTreeClient, type CategoryNode } from "@/lib/api/documents.api";
import { useAiMutations } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Send,
  FileText,
  AlertCircle,
  RotateCcw,
  User,
  Bot,
  Copy,
  Check,
  BookOpen,
  Search,
  HelpCircle,
} from "lucide-react";

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    // bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // inline code
    .replace(/`([^`]+)`/g, '<code class="bg-primary/8 text-primary px-1 py-0.5 rounded text-[13px] font-mono">$1</code>')
    // bullet lists
    .replace(/^[-•]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // headings (### → bold)
    .replace(/^#{1,3}\s+(.+)$/gm, '<p class="font-semibold text-foreground mt-2 mb-1">$1</p>')
    // line breaks
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
      className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
      title="Copy message"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/10">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-secondary/80 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.8s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceCards({ sources, onAsk }: { sources: Source[]; onAsk: (text: string) => void }) {
  if (!sources.length) return null;
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {sources.map((src) => (
        <button
          key={src.slug}
          onClick={() => onAsk(`Summarize the document "${src.title}"`)}
          className="inline-flex items-center gap-1.5 text-xs bg-white border border-border rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/3 transition-all shadow-sm cursor-pointer"
          title={`Summarize \"${src.title}\"`}
        >
          <FileText className="w-3 h-3 text-primary/60" />
          <span className="max-w-[180px] truncate">{src.title}</span>
          <Sparkles className="w-2.5 h-2.5 opacity-40" />
        </button>
      ))}
    </div>
  );
}

function MessageBubble({ msg, sources, onAsk }: { msg: ChatMessage; sources?: Source[]; onAsk: (text: string) => void }) {
  const isUser = msg.role === "user";
  return (
    <div className={`group/msg flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/20"
            : "bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm shadow-sm shadow-primary/15"
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
        {!isUser && sources && <SourceCards sources={sources} onAsk={onAsk} />}
      </div>
    </div>
  );
}

// ─── Dynamic suggestions from real content ────────────────────────────────────

const ICON_PALETTE = [
  { icon: BookOpen, color: "text-blue-500 bg-blue-50" },
  { icon: FileText, color: "text-violet-500 bg-violet-50" },
  { icon: Search, color: "text-emerald-500 bg-emerald-50" },
  { icon: HelpCircle, color: "text-amber-500 bg-amber-50" },
];

function EmptyState({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  const { data: tree, isLoading } = useQuery<CategoryNode[]>({
    queryKey: ["docs", "public-tree"],
    queryFn: () => getFullTreeClient(),
    staleTime: 5 * 60 * 1000,
  });

  // Build suggestions from real data
  const suggestions = useMemo(() => {
    if (!tree || tree.length === 0) return [];

    const items: string[] = [];

    // Pick up to 2 categories
    const activeCategories = tree.filter((c) => c.sections?.length > 0);
    for (const cat of activeCategories.slice(0, 2)) {
      items.push(`What documents are available under "${cat.name}"?`);
    }

    // Pick up to 2 specific documents
    const allDocs = tree.flatMap((c) =>
      c.sections.flatMap((s) => s.documents.map((d) => d.title))
    );
    const shuffled = allDocs.sort(() => 0.5 - Math.random());
    for (const title of shuffled.slice(0, Math.max(0, 4 - items.length))) {
      items.push(`Summarize "${title}"`);
    }

    return items.slice(0, 4);
  }, [tree]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-12">
      {/* Animated icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/10 blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center">
          <Sparkles className="w-9 h-9 text-primary" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-1.5 tracking-tight">
        Ask anything
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
        I answer questions based strictly on the Blih Brain knowledge base.
        Ask about documents, policies, procedures, or anything else.
      </p>

      {/* Suggestion cards — dynamic */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-border bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
          {suggestions.map((text, i) => {
            const { icon: Icon, color } = ICON_PALETTE[i % ICON_PALETTE.length];
            return (
              <button
                key={text}
                onClick={() => onSuggestion(text)}
                className="group flex items-start gap-3 text-left px-4 py-3 rounded-xl border border-border bg-white hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all"
              >
                <div className={`p-1.5 rounded-lg ${color} shrink-0 mt-0.5`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                  {text}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Bottom hint */}
      <p className="text-[11px] text-muted-foreground/50 mt-8">
        Powered by Gemini · Responses grounded in your knowledge base
      </p>
    </div>
  );
}

// ─── Main chat interface ──────────────────────────────────────────────────────

export function ChatInterface() {
  const { sendChatMessage } = useAiMutations();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sourcesMap, setSourcesMap] = useState<Record<number, Source[]>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle suggestion chips
  useEffect(() => {
    const handler = (e: Event) => {
      setInput((e as CustomEvent<string>).detail);
      textareaRef.current?.focus();
    };
    window.addEventListener("ai-suggestion", handler);
    return () => window.removeEventListener("ai-suggestion", handler);
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const { reply, sources } = await sendChatMessage.mutateAsync({
        message: trimmed,
        history: messages,
      });
      const assistantMsg: ChatMessage = { role: "assistant", content: reply };
      setMessages((prev) => {
        const idx = prev.length;
        setSourcesMap((m) => ({ ...m, [idx]: sources }));
        return [...prev, assistantMsg];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI service is unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, sendChatMessage]);

  const handleSuggestion = useCallback((text: string) => {
    send(text);
  }, [send]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const reset = () => {
    setMessages([]);
    setSourcesMap({});
    setError(null);
    setInput("");
  };

  const messageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 shrink-0 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">AI Assistant</span>
            <span className="text-[10px] text-muted-foreground/70 ml-2">
              Gemini · RAG
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messageCount > 0 && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {messageCount} {messageCount === 1 ? "message" : "messages"}
            </span>
          )}
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground h-8 text-xs">
              <RotateCcw className="w-3 h-3" />
              New chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {messages.length === 0 ? (
            <EmptyState onSuggestion={handleSuggestion} />
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                msg={msg}
                sources={msg.role === "assistant" ? sourcesMap[idx] : undefined}
                onAsk={handleSuggestion}
              />
            ))
          )}
          {isLoading && <TypingIndicator />}
          {error && (
            <div className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50/80 border border-red-200/60 rounded-xl px-4 py-3 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs mb-0.5">Something went wrong</p>
                <p className="text-xs text-red-500">{error}</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-3 border-t border-border/60 shrink-0 bg-white/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 items-end bg-white rounded-xl border border-border shadow-sm px-3 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about the knowledge base…"
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50 min-h-[28px] max-h-[160px] py-1.5 leading-relaxed"
            />
            <Button
              size="icon"
              className="w-8 h-8 shrink-0 rounded-lg bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all disabled:shadow-none"
              disabled={!input.trim() || isLoading}
              onClick={() => send(input)}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground/50 text-center mt-2.5">
            Enter to send · Shift+Enter for new line · Answers grounded in knowledge base only
          </p>
        </div>
      </div>
    </div>
  );
}
