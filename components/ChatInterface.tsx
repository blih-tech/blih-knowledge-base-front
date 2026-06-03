"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, Source } from "@/lib/api/ai.api";
import { useAiMutations } from "@/hooks/queries";
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
} from "lucide-react";

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
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
          className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 rounded-full px-2.5 py-1 hover:bg-primary/15 transition-colors"
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
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/10"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
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
    "What is Blih Brain?",
    "How do I search for a document?",
    "What categories are available?",
    "How do I reset my access?",
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Ask anything</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        I answer questions based strictly on the Blih Brain knowledge base.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((s) => (
          <button
            key={s}
            className="text-xs border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            onClick={() => {
              const event = new CustomEvent("ai-suggestion", { detail: s });
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

    try {
      const history = [...messages, userMsg];
      const { reply, sources } = await sendChatMessage.mutateAsync({
        message: trimmed,
        history: messages,
      });
      const assistantMsg: ChatMessage = { role: "assistant", content: reply };
      setMessages((prev) => {
        const idx = prev.length; // index of the new assistant message
        setSourcesMap((m) => ({ ...m, [idx]: sources }));
        return [...prev, assistantMsg];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI service is unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, sendChatMessage]);

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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Assistant</span>
          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
            Gemini · RAG
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
        <div className="flex gap-2 items-end bg-secondary/50 rounded-xl border border-border px-3 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about the knowledge base…"
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground disabled:opacity-50 min-h-[24px] max-h-[160px] py-1"
          />
          <Button
            size="icon"
            className="w-8 h-8 shrink-0 rounded-lg"
            disabled={!input.trim() || isLoading}
            onClick={() => send(input)}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/60 text-center mt-2">
          Enter to send · Shift+Enter for new line · Answers grounded in knowledge base only
        </p>
      </div>
    </div>
  );
}
