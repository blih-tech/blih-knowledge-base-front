"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, Source } from "@/lib/api/ai.api";
import { useAiMutations } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Send,
  FileText,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  User,
  Bot,
  Users,
  BookOpen,
} from "lucide-react";

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-violet-600" />
      </div>
      <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-violet-400/60 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
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
    <div className="mt-2 flex flex-wrap gap-2">
      <span className="text-xs text-muted-foreground self-center">Sources:</span>
      {sources.map((src) => (
        <a
          key={src.slug}
          href={`/documents/${src.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-2.5 py-1 hover:bg-violet-100 transition-colors"
        >
          <FileText className="w-3 h-3" />
          {src.title}
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </a>
      ))}
    </div>
  );
}

function MessageBubble({ msg, sources }: { msg: ChatMessage; sources?: Source[] }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-violet-600 text-white" : "bg-violet-100"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-violet-600" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-violet-600 text-white rounded-2xl rounded-br-sm"
              : "bg-secondary text-foreground rounded-2xl rounded-bl-sm"
          }`}
        >
          {msg.content}
        </div>
        {!isUser && sources && <SourceCards sources={sources} />}
      </div>
    </div>
  );
}

function EmptyState() {
  const suggestions = [
    "Summarise all client profiles and their key preferences",
    "Which clients have negative observations?",
    "What are the company's core HR procedures?",
    "List all documents under the Procedures category",
    "What does Meron Haile prefer in meetings?",
    "Summarise the promotion and transfer policy",
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-8">
      <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
        <ShieldCheck className="w-8 h-8 text-violet-600" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Internal AI Assistant</h2>
      <p className="text-sm text-muted-foreground mb-1 max-w-xs">
        Full access to all documents, FAQs, client profiles, and behavioral observations.
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground/70 mb-6">
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> All documents</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Client intelligence</span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {suggestions.map((s) => (
          <button
            key={s}
            className="text-xs border border-violet-200 rounded-full px-3 py-1.5 text-muted-foreground hover:text-violet-700 hover:border-violet-400 hover:bg-violet-50 transition-colors text-left"
            onClick={() => {
              const event = new CustomEvent("admin-ai-suggestion", { detail: s });
              window.dispatchEvent(event);
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main admin chat interface ────────────────────────────────────────────────

export function AdminChatInterface({ initialMessage = "" }: { initialMessage?: string }) {
  const { sendAdminChatMessage } = useAiMutations();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sourcesMap, setSourcesMap] = useState<Record<number, Source[]>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentInitial = useRef(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  }, [messages, isLoading]);

  useEffect(() => {
    const handler = (e: Event) => {
      setInput((e as CustomEvent<string>).detail);
      textareaRef.current?.focus();
    };
    window.addEventListener("admin-ai-suggestion", handler);
    return () => window.removeEventListener("admin-ai-suggestion", handler);
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const { reply, sources } = await sendAdminChatMessage.mutateAsync({
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
  }, [isLoading, messages, sendAdminChatMessage]);

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
    setMessages([]);
    setSourcesMap({});
    setError(null);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-semibold text-foreground">Internal AI Assistant</span>
          <span className="text-xs bg-violet-100 text-violet-700 rounded-full px-2 py-0.5 font-medium">
            Full Access · Admin Only
          </span>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
            New chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 min-h-0">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              msg={msg}
              sources={msg.role === "assistant" ? sourcesMap[idx] : undefined}
            />
          ))
        )}
        {isLoading && <TypingIndicator />}
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border shrink-0">
        <div className="flex gap-2 items-end bg-secondary/50 rounded-xl border border-border px-3 py-2 focus-within:border-violet-400/60 focus-within:ring-1 focus-within:ring-violet-400/20 transition">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about clients, documents, procedures, or anything in the knowledge base…"
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50 min-h-[24px] max-h-[160px] py-1"
          />
          <button
            disabled={!input.trim() || isLoading}
            onClick={() => send(input)}
            className="w-8 h-8 shrink-0 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground/60 text-center mt-2">
          Enter to send · Shift+Enter for new line · Internal use only — full knowledge base access
        </p>
      </div>
    </div>
  );
}
