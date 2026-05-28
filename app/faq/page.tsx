import { Header } from "@/components/Header";
import { getAllFaqs, type Faq } from "@/lib/api/faq.api";
import { HelpCircle, ChevronDown } from "lucide-react";

export const metadata = {
  title: "FAQ — Blih Brain",
  description: "Frequently asked questions about Blih Brain Knowledge Base.",
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  let faqs: Faq[] = [];
  try {
    faqs = await getAllFaqs();
  } catch {
    faqs = [];
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero */}
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Frequently Asked Questions
          </h1>
        </div>
        <p className="text-muted-foreground mb-10 text-base">
          Can't find what you need? Try the{" "}
          <a href="/" className="text-primary underline underline-offset-4">
            search
          </a>{" "}
          or reach out to your admin.
        </p>

        {faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <HelpCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No FAQs yet. Check back soon.</p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden shadow-sm">
            {faqs.map((faq) => (
              <details key={faq._id} className="group bg-white">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none list-none hover:bg-secondary/50 transition-colors">
                  <span className="text-sm font-medium text-foreground">{faq.question}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
