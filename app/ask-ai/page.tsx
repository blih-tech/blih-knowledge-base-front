import { Header } from "@/components/Header";
import { Sparkles, Search } from "lucide-react";

export const metadata = {
  title: "Ask AI — Blih Brain",
  description: "Ask our AI assistant anything about the knowledge base.",
};

export default function AskAiPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header showNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
          Ask AI
        </h1>
        <p className="text-muted-foreground text-base mb-10 max-w-md mx-auto">
          Get instant answers from our knowledge base powered by AI. Ask
          anything about our products, policies, or processes.
        </p>

        {/* Coming-soon search input placeholder */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            disabled
            placeholder="Ask a question… (coming soon)"
            className="w-full h-14 pl-12 pr-6 rounded-xl border border-border bg-white shadow-sm text-sm text-muted-foreground cursor-not-allowed focus:outline-none"
          />
        </div>

        <p className="mt-6 text-xs text-muted-foreground/60">
          AI assistant is currently under development. Check back soon!
        </p>
      </main>
    </div>
  );
}
